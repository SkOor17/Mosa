import { boursobankStrategy } from './strategies/boursobank-strategy';
import { bnpStrategy } from './strategies/bnp-strategy';
import { CsvParsingStrategy } from './parsing-strategy';

/**
 * A registry of all available CSV parsing strategies.
 * The key is the strategy's name.
 */
const strategies: Record<string, CsvParsingStrategy> = {
    [boursobankStrategy.name]: boursobankStrategy,
    [bnpStrategy.name]: bnpStrategy,
};

/**
 * Manages CSV parsing strategies.
 */
export const parserManager = {
    /**
     * Retrieves a parsing strategy by its name.
     * @param name The name of the bank/strategy.
     * @returns The corresponding strategy, or undefined if not found.
     */
    getStrategy: (name: string): CsvParsingStrategy | undefined => strategies[name],

    /**
     * Gets a list of all available bank names.
     * @returns An array of strings representing the available banks.
     */
    getAvailableBanks: (): string[] => Object.keys(strategies),
};
