"use server"

import {actionClient} from "@/src/lib/action";
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import {z} from "zod";
import {TransactionType} from "@/app/generated/prisma";
import {SummaryDataByMonth, SummaryDataByYear} from "@/src/lib/interface/summary";

const GetSummaryDataByMonthSchema = z.object({
    year: z.number(),
});

export const getSummaryDataByMonth = actionClient
    .inputSchema(GetSummaryDataByMonthSchema)
    .action(async ({parsedInput: {year}}): Promise<{ data: SummaryDataByMonth[] }> => {
        const user = await getRequiredUser();

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                }
            },
            include: {
                category: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        const monthlyData: {
            [month: number]: { total: number; expensesByCategory: { [category: string]: number } }
        } = {};

        for (let i = 0; i < 12; i++) {
            monthlyData[i] = {total: 0, expensesByCategory: {}};
        }

        transactions.forEach(transaction => {
            const month = transaction.date.getMonth();
            monthlyData[month].total += transaction.amount.toNumber();

            if (transaction.type === TransactionType.EXPENSE) {
                const categoryName = transaction.category?.name || "Uncategorized";
                if (!monthlyData[month].expensesByCategory[categoryName]) {
                    monthlyData[month].expensesByCategory[categoryName] = 0;
                }
                monthlyData[month].expensesByCategory[categoryName] += Math.abs(transaction.amount.toNumber());
            }
        });

        const result = Object.entries(monthlyData).map(([month, data]) => ({
            month: parseInt(month),
            total: data.total,
            expensesByCategory: data.expensesByCategory,
        }));

        return {data: result};
    });

export const getSummaryDataByYear = actionClient.action(async (): Promise<{ data: SummaryDataByYear[] }> => {
    const user = await getRequiredUser();

    const transactions = await prisma.transaction.findMany({
        where: {
            userId: user.id,
        },
        select: {
            date: true,
            amount: true,
        },
        orderBy: {
            date: "asc",
        },
    });

    const yearlyData: { [year: number]: { total: number } } = {};

    transactions.forEach(transaction => {
        const year = transaction.date.getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = { total: 0 };
        }
        yearlyData[year].total += transaction.amount.toNumber();
    });

    const result = Object.entries(yearlyData).map(([year, data]) => ({
        year: parseInt(year),
        total: data.total,
    }));

    return {data: result};
});
