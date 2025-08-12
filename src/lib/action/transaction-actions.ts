"use server"

import {z} from "zod";
import {actionClient} from "@/src/lib/action";
import {TransactionType} from "@/app/generated/prisma";
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import {revalidatePath} from "next/cache";

const TransactionSchema = z.object({
    amount: z.number().min(0),
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
    description: z.string(),
    date: z.date(),
    categoryName: z.string().min(0),
    bankAccount: z.string().min(0),
});

export const addTransactionAction = actionClient
    .inputSchema(TransactionSchema)
    .action(async ({parsedInput: {amount, type, description, date, categoryName, bankAccount}}) => {
        const user = await getRequiredUser()

        // Récupération de l'ID de la catégorie
        const categoryId = await prisma.category.findFirst({
            where: {
                userId: user.id,
                name: categoryName,
            },
            select: {
                id: true,
            },
        })

        if (!categoryId) {
            throw new Error("Categorie not found")
        }

        // Récupération de l'ID du compte bancaire
        const bankAccountId = await prisma.bankAccount.findFirst({
            where: {
                name: bankAccount,
                users: {
                    some: {
                        userId: user.id
                    }
                }
            },
            select: {
                id: true,
            },
        })

        if (!bankAccountId) {
            throw new Error("Bank account not found")
        }

        const formattedAmount = type === TransactionType.EXPENSE ? amount * -1 : amount

        // Création de la transaction
        const createdTransaction = await prisma.transaction.create({
            data: {
                amount: formattedAmount,
                type,
                description,
                date,
                categoryId: categoryId?.id || null,
                userId: user.id,
                bankAccountId: bankAccountId.id,
            },
        })

        // Mise à jour du montant du compte
        await prisma.bankAccount.update({
            where: {
                id: bankAccountId.id
            },
            data: {
                currentAmount: {
                    increment: formattedAmount
                }
            }
        })

        revalidatePath("/dashboard")
        return {id: createdTransaction.id, amount: createdTransaction.amount.toNumber()}
    })