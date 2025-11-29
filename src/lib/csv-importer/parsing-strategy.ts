import { TransactionType } from "@/app/generated/prisma";

/**
 * Represents a transaction that has been parsed from a CSV file,
 * ready to be validated and imported.
 */
export type ParsedTransaction = {
    date: Date;
    description: string;
    amount: number;
    type: TransactionType;
};

/**
 * Defines the contract for a CSV parsing strategy for a specific bank.
 */
export interface CsvParsingStrategy {
    /**
     * The name of the bank or strategy (e.g., "BoursoBank").
     */
    readonly name: string;

    /**
     * Parses a given CSV file and returns an array of transactions.
     * @param file The CSV file to parse.
     * @returns A promise that resolves to an array of ParsedTransaction.
     * @throws An error if parsing fails.
     */
    parse(file: File): Promise<ParsedTransaction[]>;
}
