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
import Papa from "papaparse";
import { TransactionType } from "@/app/generated/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { addMultipleTransactionsAction } from "@/src/lib/action/transaction-actions";
import { parse, isValid } from 'date-fns';

enum STEPS {
    UPLOAD,
    PREVIEW,
}

// Définit la structure attendue d'une ligne dans le CSV de BoursoBank
interface BoursoBankCsvRow {
    dateOp: string;
    label: string;
    amount: string;
}

type ParsedTransaction = {
    date: Date;
    description: string;
    amount: number;
    type: TransactionType;
};

export default function ImportTransactionsButton({ bankAccountId }: { bankAccountId: number }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<STEPS>(STEPS.UPLOAD);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileParse = () => {
        if (!file) {
            toast.error("Veuillez sélectionner un fichier.");
            return;
        }
        setIsLoading(true);

        Papa.parse<BoursoBankCsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            delimiter: ";",
            complete: (results) => {
                const transactions: ParsedTransaction[] = [];
                results.data.forEach((row, index) => {
                    console.log(row);
                    
                    // Vérification que les champs requis existent
                    if (!row.dateOp || !row.label || row.amount === undefined) {
                        console.warn(`Ligne ${index + 2} ignorée: champs manquants.`, row);
                        return;
                    }

                    const parsedDate = parse(row.dateOp, 'yyyy-MM-dd', new Date());
                    if (!isValid(parsedDate)) {
                        console.warn(`Ligne ${index + 2} ignorée: format de date invalide (${row.dateOp}).`);
                        return;
                    }

                    const amountValue = row.amount.replace(/\s/g, '').replace(',', '.');
                    const amount = parseFloat(amountValue);

                    if (isNaN(amount)) {
                        console.warn(`Ligne ${index + 2} ignorée: montant invalide (${row.amount}).`);
                        return;
                    }

                    transactions.push({
                        date: parsedDate,
                        description: row.label,
                        amount: Math.abs(amount),
                        type: amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME,
                    });
                });

                if (transactions.length === 0) {
                    toast.error("Aucune transaction valide trouvée.", {
                        description: "Vérifiez que le fichier CSV contient les colonnes 'dateOp', 'label', 'amount' et que le délimiteur est bien un point-virgule (;).",
                    });
                    setIsLoading(false);
                    return;
                }

                setParsedData(transactions);
                setStep(STEPS.PREVIEW);
                setIsLoading(false);
            },
            error: (error) => {
                toast.error("Erreur lors de l'analyse du fichier.", {
                    description: error.message
                });
                console.error(error);
                setIsLoading(false);
            }
        });
    };

    const handleConfirmImport = async () => {
        setIsLoading(true);
        try {
            const result = await addMultipleTransactionsAction({
                transactions: parsedData,
                bankAccountId,
            });

            if (result.serverError) {
                throw new Error(result.serverError);
            }
            
            toast.success("Transactions importées avec succès !");
            handleClose(false)
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
                    <Select defaultValue="boursobank" disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une banque" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="boursobank">BoursoBank</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button onClick={handleFileParse} disabled={!file || isLoading}>
                        {isLoading ? "Analyse en cours..." : "Prévisualiser les données"}
                    </Button>
                </div>
            )}

            {step === STEPS.PREVIEW && (
                <div className="flex flex-col gap-4">
                    <p>Voici les transactions qui seront importées. Confirmez-vous l&apos;importation ?</p>
                    <div className="overflow-auto max-h-64">
                        <div className="rounded-md border max-w-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Montant</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((transaction, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{transaction.date.toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>{transaction.amount.toFixed(2)}€</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                         <Button variant="ghost" onClick={() => setStep(STEPS.UPLOAD)}>Retour</Button>
                        <Button onClick={handleConfirmImport} disabled={isLoading}>
                            {isLoading ? "Importation..." : "Importer"}
                        </Button>
                    </div>
                </div>
            )}
        </ResponsiveModal>
    );
}