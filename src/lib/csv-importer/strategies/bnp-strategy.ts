import { CsvParsingStrategy, ParsedTransaction } from "../parsing-strategy";
import Papa from "papaparse";
import { parse, isValid } from "date-fns";
import { TransactionType } from "@/app/generated/prisma";

// Expected structure for a row in a BNP CSV.
interface BnpCsvRow {
    "Date operation": string;
    "Libelle operation": string;
    "Montant operation": string;
}

class BnpParsingStrategy implements CsvParsingStrategy {
    readonly name = "BNP Paribas";

    parse(file: File): Promise<ParsedTransaction[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<BnpCsvRow>(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: ";",
                complete: (results) => {
                    const transactions: ParsedTransaction[] = [];
                    results.data.forEach((row, index) => {
                        const dateValue = row["Date operation"];
                        const labelValue = row["Libelle operation"];
                        const amountValue = row["Montant operation"];

                        if (!dateValue || !labelValue || amountValue === undefined) {
                            console.warn(`[${this.name}] Ligne ${index + 2} ignorée: champs manquants.`, row);
                            return;
                        }

                        const parsedDate = parse(dateValue, 'dd-MM-yyyy', new Date());
                        if (!isValid(parsedDate)) {
                            console.warn(`[${this.name}] Ligne ${index + 2} ignorée: format de date invalide (${dateValue}).`);
                            return;
                        }

                        const sanitizedAmount = amountValue.replace(/\s/g, '').replace(',', '.');
                        const amount = parseFloat(sanitizedAmount);

                        if (isNaN(amount)) {
                            console.warn(`[${this.name}] Ligne ${index + 2} ignorée: montant invalide (${amountValue}).`);
                            return;
                        }

                        transactions.push({
                            date: parsedDate,
                            description: labelValue,
                            amount: Math.abs(amount),
                            type: amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME,
                        });
                    });
                    
                    if (results.errors.length > 0) {
                        console.error(`[${this.name}] Erreurs de parsing:`, results.errors);
                    }

                    resolve(transactions);
                },
                error: (error) => {
                    console.error(`[${this.name}] Erreur de parsing du fichier:`, error);
                    reject(new Error("Une erreur est survenue lors de l'analyse du fichier CSV."));
                },
            });
        });
    }
}

export const bnpStrategy = new BnpParsingStrategy();
