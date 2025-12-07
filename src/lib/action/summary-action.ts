"use server"

import {actionClient} from "@/src/lib/action";
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import {z} from "zod";
import {Prisma, TransactionType} from "@/app/generated/prisma";
import {SummaryDataByMonth, SummaryDataByYear} from "@/src/lib/interface/summary";

const GetSummaryDataByMonthSchema = z.object({
    year: z.number(),
    bankAccountId: z.string().optional(),
});

export const getSummaryDataByMonth = actionClient
    .inputSchema(GetSummaryDataByMonthSchema)
    .action(async ({parsedInput: {year, bankAccountId}}): Promise<{ data: SummaryDataByMonth[] }> => {
        const user = await getRequiredUser();

        const transactionWhere: Prisma.TransactionWhereInput = {
            userId: user.id,
        };
        if (bankAccountId && bankAccountId !== 'all') {
            transactionWhere.bankAccountId = parseInt(bankAccountId);
        }

        const bankAccountWhere: Prisma.BankAccountWhereInput = {
            users: {
                some: {
                    userId: user.id,
                },
            },
        };
        if (bankAccountId && bankAccountId !== 'all') {
            bankAccountWhere.id = parseInt(bankAccountId);
        }

        const firstTransaction = await prisma.transaction.findFirst({
            where: transactionWhere,
            orderBy: {date: 'asc'},
            select: {date: true}
        });

        if (!firstTransaction) {
            return {
                data: Array.from({length: 12}, (_, i) => ({
                    month: i,
                    total: 0,
                    expensesByCategory: {},
                }))
            };
        }

        const bankAccounts = await prisma.bankAccount.findMany({
            where: bankAccountWhere,
            select: {
                currentAmount: true,
            }
        });
        const totalCurrentAmount = bankAccounts.reduce((sum, acc) => sum + acc.currentAmount.toNumber(), 0);

        const now = new Date();
        const startOfYear = new Date(year, 0, 1);

        if (year > now.getFullYear()) {
            const result = Array.from({length: 12}, (_, i) => ({
                month: i,
                total: 0,
                expensesByCategory: {},
            }));
            return {data: result};
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                ...transactionWhere,
                date: {
                    gte: startOfYear,
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                date: 'asc',
            }
        });

        const totalTransactionsAmount = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);
        let monthlyBalance = totalCurrentAmount - totalTransactionsAmount;

        const monthlyData: {
            [month: number]: { total: number; expensesByCategory: { [category: string]: number } }
        } = {};

        for (let i = 0; i < 12; i++) {
            monthlyData[i] = {total: 0, expensesByCategory: {}};
        }

        const transactionsByMonth: { [month: number]: (typeof transactions[number])[] } = {};
        for (let i = 0; i < 12; i++) {
            transactionsByMonth[i] = [];
        }
        transactions.forEach(t => {
            if (t.date.getFullYear() === year) {
                const month = t.date.getMonth();
                transactionsByMonth[month].push(t);
            }
        });

        for (let i = 0; i < 12; i++) {
            const monthTransactions = transactionsByMonth[i] || [];
            const monthTotalChange = monthTransactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);
            monthlyBalance += monthTotalChange;

            if (year < now.getFullYear() || (year === now.getFullYear() && i <= now.getMonth())) {
                monthlyData[i].total = monthlyBalance;
            } else {
                monthlyData[i].total = 0;
            }

            const expenses: { [category: string]: number } = {};
            monthTransactions.forEach(transaction => {
                if (transaction.type === TransactionType.EXPENSE) {
                    const categoryName = transaction.category?.name || "Uncategorized";
                    if (!expenses[categoryName]) {
                        expenses[categoryName] = 0;
                    }
                    expenses[categoryName] += Math.abs(transaction.amount.toNumber());
                }
            });
            monthlyData[i].expensesByCategory = expenses;
        }

        const result = Object.entries(monthlyData).map(([month, data]) => ({
            month: parseInt(month),
            total: data.total,
            expensesByCategory: data.expensesByCategory,
        }));

        const firstTransactionDate = firstTransaction.date;
        if (year < firstTransactionDate.getFullYear()) {
            result.forEach(r => r.total = 0);
        } else if (year === firstTransactionDate.getFullYear()) {
            for (const monthResult of result) {
                if (monthResult.month < firstTransactionDate.getMonth()) {
                    monthResult.total = 0;
                }
            }
        }

        return {data: result};
    });

const GetSummaryDataByYearSchema = z.object({
    bankAccountId: z.string().optional(),
});

export const getSummaryDataByYear = actionClient
    .inputSchema(GetSummaryDataByYearSchema)
    .action(async ({parsedInput: {bankAccountId}}): Promise<{ data: SummaryDataByYear[] }> => {
        const user = await getRequiredUser();

        const transactionWhere: Prisma.TransactionWhereInput = {
            userId: user.id,
        };
        if (bankAccountId && bankAccountId !== 'all') {
            transactionWhere.bankAccountId = parseInt(bankAccountId);
        }

        const bankAccountWhere: Prisma.BankAccountWhereInput = {
            users: {
                some: {
                    userId: user.id,
                },
            },
        };
        if (bankAccountId && bankAccountId !== 'all') {
            bankAccountWhere.id = parseInt(bankAccountId);
        }

        const firstTransaction = await prisma.transaction.findFirst({
            where: transactionWhere,
            orderBy: {date: 'asc'},
            select: {date: true}
        });

        if (!firstTransaction) {
            return {data: [{year: new Date().getFullYear(), total: 0}]};
        }

        const bankAccounts = await prisma.bankAccount.findMany({
            where: bankAccountWhere,
            select: {currentAmount: true}
        });
        const totalCurrentAmount = bankAccounts.reduce((sum, acc) => sum + acc.currentAmount.toNumber(), 0);

        const transactions = await prisma.transaction.findMany({
            where: transactionWhere,
            select: {
                date: true,
                amount: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        const yearlyData: { [year: number]: { total: number } } = {};
        const transactionTotalByYear: { [year: number]: number } = {};

        transactions.forEach(t => {
            const year = t.date.getFullYear();
            if (!transactionTotalByYear[year]) {
                transactionTotalByYear[year] = 0;
            }
            transactionTotalByYear[year] += t.amount.toNumber();
        });

        const minYear = firstTransaction.date.getFullYear();
        const maxYear = new Date().getFullYear();

        const allTransactionsAmount = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);

        let yearlyBalance = totalCurrentAmount - allTransactionsAmount;

        for (let year = minYear; year <= maxYear; year++) {
            const yearTotal = transactionTotalByYear[year] || 0;
            yearlyBalance += yearTotal;
            yearlyData[year] = {total: yearlyBalance};
        }

        const result = Object.entries(yearlyData).map(([year, data]) => ({
            year: parseInt(year),
            total: data.total,
        }));

        return {data: result};
    });
