import React from 'react';
import {prisma} from "@/src/lib/prisma";
import AddTransactionButton from "@/src/components/buttons/add-transaction-button";
import {DataTable} from "@/app/(protected)/[bankAccountId]/transactions/data-table";
import {getRequiredUser} from "@/src/lib/auth-session";
import {SummaryExpenseChart} from "@/app/(protected)/[bankAccountId]/transactions/summary-expense-chart";

const getData = async (bankAccountId: number | undefined, userId: string) => {
    const transactions = await prisma.transaction.findMany({
        where: {
            bankAccountId: bankAccountId,
            userId: userId
        },
        include: {
            category: true,
            bankAccount: true
        }
    })

    return transactions.map((transaction) => ({
        id: transaction.id,
        bankAccount: transaction.bankAccount.name,
        category: transaction.category?.name || 'inconnu',
        amount: transaction.amount.toNumber() + ' €',
        type: transaction.type,
        description: transaction.description,
        date: transaction.date.toLocaleDateString('fr-FR')
    }))
}

// TODO: create API route
const getCategoryExpenses = async (bankAccountId: number, userId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
        where: {
            bankAccountId: bankAccountId,
            userId: userId,
            type: 'EXPENSE', // Seulement les dépenses
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        include: {
            category: true
        }
    });

    // Grouper les transactions par catégorie et calculer le total
    const categoryTotals = transactions.reduce((acc, transaction) => {
        const categoryId = transaction.categoryId;
        const categoryName = transaction.category?.name || 'inconnu';
        const amount = transaction.amount.toNumber();

        if (!acc[categoryId || 'unknown']) {
            acc[categoryId || 'unknown'] = {
                id: categoryId || 0,
                name: categoryName,
                totalExpense: 0
            };
        }

        acc[categoryId || 'unknown'].totalExpense += Math.abs(amount); // Math.abs pour s'assurer que c'est positif

        return acc;
    }, {} as Record<string, { id: number; name: string; totalExpense: number }>);

    return Object.values(categoryTotals);
}

const TransactionDataTable = async (
    {bankAccountId}: {bankAccountId: number}
) => {
    const user = await getRequiredUser()
    const data = await getData(bankAccountId, user.id)

    const categories = await prisma.category.findMany({
        where: {
            userId: user.id
        }
    })

    const bankAccounts = await prisma.bankAccountUser.findMany({
        where: { userId: user.id },
        include: { bankAccount: true }
    })

    const categoryOptions = categories.map((category) => (category.name))
    const bankAccountsProp = bankAccounts.map(ba => ({id: ba.bankAccount.id, name: ba.bankAccount.name, default: ba.bankAccount.id === bankAccountId}))
    const expenseCategories = await getCategoryExpenses(bankAccountId, user.id)

    return (
        <div className={"flex flex-col gap-4"}>
            <div className={"flex flex-col"}>
                <div className={"md:hidden"}>
                    <AddTransactionButton categories={categories} bankAccounts={bankAccountsProp}/>
                </div>
                <DataTable
                    data={data}
                    categoryOptions={categoryOptions}
                    categories={categories}
                    bankAccounts={bankAccountsProp}
                    addButton={<AddTransactionButton categories={categories} bankAccounts={bankAccountsProp}/>}
                />
            </div>
            {expenseCategories &&
                <SummaryExpenseChart
                    expenseCategories={expenseCategories}
                />
            }
        </div>
    );
};

export default TransactionDataTable;