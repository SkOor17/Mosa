import { CsvParsingStrategy, ParsedTransaction } from "../parsing-strategy";
import Papa from "papaparse";
import { parse, isValid } from "date-fns";
import { TransactionType } from "@/app/generated/prisma";

// Expected structure for a row in a BoursoBank CSV.
interface BoursoBankCsvRow {
    dateOp: string;
    label: string;
    amount: string;
}

class BoursoBankParsingStrategy implements CsvParsingStrategy {
    readonly name = "BoursoBank";

    parse(file: File): Promise<ParsedTransaction[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<BoursoBankCsvRow>(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: ";",
                complete: (results) => {
                    const transactions: ParsedTransaction[] = [];
                    results.data.forEach((row, index) => {
                        if (!row.dateOp || !row.label || row.amount === undefined) {
                            console.warn(`[${this.name}] Ligne ${index + 2} ignorée: champs manquants.`, row);
                            return;
                        }

                        const parsedDate = parse(row.dateOp, 'yyyy-MM-dd', new Date());
                        if (!isValid(parsedDate)) {
                            console.warn(`[${this.name}] Ligne ${index + 2} ignorée: format de date invalide (${row.dateOp}).`);
                            return;
                        }

                        const amountValue = row.amount.replace(/\s/g, '').replace(',', '.');
                        const amount = parseFloat(amountValue);

                        if (isNaN(amount)) {
                            console.warn(`[${this.name}] Ligne ${index + 2} ignorée: montant invalide (${row.amount}).`);
                            return;
                        }

                        transactions.push({
                            date: parsedDate,
                            description: row.label,
                            amount: Math.abs(amount),
                            type: amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME,
                        });
                    });
                    
                    if (results.errors.length > 0) {
                        console.error(`[${this.name}] Erreurs de parsing:`, results.errors);
                        // Optionally, you could reject here if any row has an error
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

export const boursobankStrategy = new BoursoBankParsingStrategy();
