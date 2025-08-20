"use server"

import {z} from "zod";
import {actionClient} from "@/src/lib/action";
import {TransactionType} from "@/app/generated/prisma";
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import {revalidatePath} from "next/cache";

const AddTransactionSchema = z.object({
    amount: z.number().min(0),
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
    description: z.string(),
    date: z.date(),
    categoryName: z.string().min(0),
    bankAccount: z.string().min(0),
});

export const addTransactionAction = actionClient
    .inputSchema(AddTransactionSchema)
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

const RemoveTransactionsSchema = z.object({
    ids: z.array(z.number().min(0)).min(1, "At least one transaction ID is required")
})

export const removeTransactionsAction = actionClient
    .inputSchema(RemoveTransactionsSchema)
    .action(async ({ parsedInput: { ids } }) => {
        const user = await getRequiredUser()

        // Vérification que l'utilisateur est bien propriétaire des transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                id: {
                    in: ids,
                },
                userId: user.id,
            },
            select: {
                id: true,
                bankAccountId: true,
                amount: true,
            },
        });

        if (transactions.length !== ids.length) {
            throw new Error("Unauthorized or some transactions not found");
        }

        // Suppression des transactions
        await prisma.transaction.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        // Mise à jour des montants des comptes bancaires
        const bankAccountUpdates = transactions.reduce<Record<number, number>>((acc, transaction) => {
            const amount = transaction.amount.toNumber();
            if (!acc[transaction.bankAccountId]) {
                acc[transaction.bankAccountId] = 0;
            }
            acc[transaction.bankAccountId] += amount;
            return acc;
        }, {});
        for (const [bankAccountId, amount] of Object.entries(bankAccountUpdates)) {
            await prisma.bankAccount.update({
                where: { id: Number(bankAccountId) },
                data: { currentAmount: { increment: -amount } },
            });
        }

        revalidatePath("/dashboard")
})

const UpdateTransactionSchema = z.object({
    id: z.number().min(0),
    amount: z.number(),
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
    description: z.string(),
    date: z.date(),
    categoryName: z.string(),
    bankAccount: z.string(),
});

export const updateTransactionAction = actionClient
    .inputSchema(UpdateTransactionSchema)
    .action(async ({parsedInput: {id, amount, type, description, date, categoryName, bankAccount}}) => {
        const user = await getRequiredUser()

        // 1. Récupérer la transaction actuelle pour connaître l'ancien compte et montant
        const currentTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: user.id // Sécurité : s'assurer que la transaction appartient à l'utilisateur
            },
            select: {
                bankAccountId: true,
                amount: true,
                type: true
            }
        })

        if (!currentTransaction) {
            throw new Error("Transaction not found")
        }

        // 2. Récupération de l'ID de la catégorie
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
            throw new Error("Category not found")
        }

        // 3. Récupération de l'ID du nouveau compte bancaire
        const newBankAccountId = await prisma.bankAccount.findFirst({
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

        if (!newBankAccountId) {
            throw new Error("Bank account not found")
        }

        const newFormattedAmount = type === TransactionType.EXPENSE ? amount * -1 : amount

        // 4. Utiliser une transaction Prisma pour assurer la cohérence
        const result = await prisma.$transaction(async (tx) => {
            // Mise à jour de la transaction
            const updatedTransaction = await tx.transaction.update({
                where: { id },
                data: {
                    amount: newFormattedAmount,
                    type,
                    description,
                    date,
                    categoryId: categoryId?.id || null,
                    bankAccountId: newBankAccountId.id,
                },
            })

            // 5. Si le compte bancaire a changé, mettre à jour les deux comptes
            if (currentTransaction.bankAccountId !== newBankAccountId.id) {
                // Retirer l'ancien montant du compte d'origine
                await tx.bankAccount.update({
                    where: {
                        id: currentTransaction.bankAccountId
                    },
                    data: {
                        currentAmount: {
                            decrement: currentTransaction.amount.toNumber()
                        }
                    }
                })

                // Ajouter le nouveau montant au nouveau compte
                await tx.bankAccount.update({
                    where: {
                        id: newBankAccountId.id
                    },
                    data: {
                        currentAmount: {
                            increment: newFormattedAmount
                        }
                    }
                })
                return updatedTransaction

            }
            // 6. Si c'est le même compte, calculer la différence
            const amountDifference = newFormattedAmount - currentTransaction.amount.toNumber()

            if (amountDifference !== 0) {
                await tx.bankAccount.update({
                    where: {
                        id: currentTransaction.bankAccountId
                    },
                    data: {
                        currentAmount: {
                            increment: amountDifference
                        }
                    }
                })
            }

            return updatedTransaction
        })

        revalidatePath("/dashboard")
        return {id: result.id, amount: result.amount.toNumber()}
    })