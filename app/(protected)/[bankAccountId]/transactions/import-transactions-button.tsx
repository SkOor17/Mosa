"use client"

import { Button } from "@/src/components/ui/button";
import { Upload } from "lucide-react";
import { ResponsiveModal } from "@/src/components/ui/responsive-modal";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { addMultipleTransactionsAction } from "@/src/lib/action/transaction-actions";
import { parserManager } from "@/src/lib/csv-importer";
import { ParsedTransaction } from "@/src/lib/csv-importer/parsing-strategy";

enum STEPS {
    UPLOAD,
    PREVIEW,
}

const availableBanks = parserManager.getAvailableBanks();

export default function ImportTransactionsButton({ bankAccountId }: { bankAccountId: number }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<STEPS>(STEPS.UPLOAD);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBank, setSelectedBank] = useState<string | undefined>(availableBanks[0]);

    const handleFileParse = async () => {
        if (!file) {
            toast.error("Veuillez sélectionner un fichier.");
            return;
        }
        if (!selectedBank) {
            toast.error("Veuillez sélectionner une banque.");
            return;
        }
        
        setIsLoading(true);

        try {
            const strategy = parserManager.getStrategy(selectedBank);
            if (!strategy) {
                throw new Error("La stratégie de parsing pour cette banque est introuvable.");
            }

            const transactions = await strategy.parse(file);

            if (transactions.length === 0) {
                toast.error("Aucune transaction valide n'a été trouvée dans le fichier.", {
                    description: "Vérifiez que le format du fichier correspond à celui de la banque sélectionnée.",
                });
                return;
            }

            setParsedData(transactions);
            setStep(STEPS.PREVIEW);
        } catch (error) {
            toast.error("Erreur lors de l'analyse du fichier.", {
                description: error instanceof Error ? error.message : "Une erreur inconnue est survenue."
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        setIsLoading(true);
        try {
            await addMultipleTransactionsAction({
                transactions: parsedData,
                bankAccountId,
            });
            toast.success("Transactions importées avec succès !");
            handleClose(false);
        } catch (error) {
            toast.error("Erreur lors de l'importation des transactions.", {
                description: error instanceof Error ? error.message : "Une erreur inconnue est survenue."
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setStep(STEPS.UPLOAD);
        setIsLoading(false);
        setSelectedBank(availableBanks[0]);
    }

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetState();
        }
        setOpen(isOpen);
    }

    return (
        <ResponsiveModal
            open={open}
            onOpenChange={handleClose}
            trigger={
                <Button>
                    <Upload className={"h-4 w-4 mr-2"} />
                    Importer
                </Button>
            }
            title={step === STEPS.UPLOAD ? "Importer des transactions" : "Prévisualisation"}
        >
            {step === STEPS.UPLOAD && (
                <div className="flex flex-col gap-4">
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une banque" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableBanks.map((bank) => (
                                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button onClick={handleFileParse} disabled={!file || !selectedBank || isLoading}>
                        {isLoading ? "Analyse en cours..." : "Prévisualiser les données"}
                    </Button>
                </div>
            )}

            {step === STEPS.PREVIEW && (
                <div className="flex flex-col gap-4">
                    <p>Voici les transactions qui seront importées. Confirmez-vous l&apos;importation ?</p>
                    <div className="w-full overflow-auto max-h-64">
                        <div className="rounded-md border max-w-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((transaction, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{transaction.date.toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>{transaction.amount.toFixed(2)}€</TableCell>
                                            <TableCell>{transaction.type === "INCOME" ? "Revenu" : "Dépense"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                         <Button variant="ghost" onClick={() => setStep(STEPS.UPLOAD)}>Retour</Button>
                        <Button onClick={handleConfirmImport} disabled={isLoading}>
                            {isLoading ? "Importation..." : "Confirmer et Importer"}
                        </Button>
                    </div>
                </div>
            )}
        </ResponsiveModal>
    );
}
