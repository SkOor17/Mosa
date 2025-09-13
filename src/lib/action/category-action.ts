"use server"

import {actionClient} from "@/src/lib/action";
import {getRequiredUser} from "@/src/lib/auth-session";
import {prisma} from "@/src/lib/prisma";
import {revalidatePath} from "next/cache";
import {z} from "zod";

const AddCategorySchema = z.object({
    name: z.string().min(1, "Le nom de la catégorie est requis"),
    percentage: z.coerce.number().min(0).max(100).default(0),
    month: z.date().optional(),
})

export const addCategoryAction = actionClient
    .inputSchema(AddCategorySchema)
    .action(async ({parsedInput: {name, percentage, month}}) => {
        const user = await getRequiredUser()

        const budgetMonth = month || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const existingCategory = await prisma.category.findFirst({
            where: {
                userId: user.id,
                name: name.trim(),
            }
        });

        if (existingCategory) {
            throw new Error("Une catégorie avec ce nom existe déjà");
        }

        const result = await prisma.$transaction(async (tx) => {
            const category = await tx.category.create({
                data: {
                    name: name.trim(),
                    userId: user.id,
                },
            });

            const budget = await tx.budget.create({
                data: {
                    userId: user.id,
                    categoryId: category.id,
                    month: budgetMonth,
                    percentage: percentage,
                },
            });

            return { category, budget };
        });

        revalidatePath("/dashboard")
        return {
            id: result.category.id,
            name: result.category.name,
            budgetId: result.budget.id,
            budgetPercentage: Number(result.budget.percentage)
        };
    })

const UpdateCategorySchema = z.object({
    id: z.number().min(1, "L'id de la catégorie est requis"),
    name: z.string().optional(),
    percentage: z.coerce.number().min(0).max(100).optional(),
})

export const updateCategoryAction = actionClient
    .inputSchema(UpdateCategorySchema)
    .action(async ({parsedInput: {id, name, percentage}}) => {
        const user = await getRequiredUser()

        const category = await prisma.category.findFirst({
            where: {
                id: id,
                userId: user.id,
            },
            include: {
                budget: true,
            }
        });

        if (!category) {
            throw new Error("Catégorie introuvable ou vous n'avez pas les permissions pour la modifier");
        }

        // Vérifier si le nouveau nom n'existe pas déjà (si fourni)
        if (name && name.trim() !== category.name) {
            const existingCategory = await prisma.category.findFirst({
                where: {
                    userId: user.id,
                    name: name.trim(),
                    id: { not: id }
                }
            });

            if (existingCategory) {
                throw new Error("Une catégorie avec ce nom existe déjà");
            }
        }

        const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const result = await prisma.$transaction(async (tx) => {
            const updatedCategory = name ? await tx.category.update({
                where: {
                    id: id,
                    userId: user.id,
                },
                data: {
                    name: name.trim(),
                },
            }) : category;

            // Early return si pas de pourcentage à mettre à jour (undefined ou null)
            if (percentage === undefined || percentage === null) {
                return { category: updatedCategory, budget: null };
            }

            // Chercher le budget pour le mois courant
            const currentBudget = category.budget.find(b => 
                b.month.getTime() === currentMonth.getTime()
            );

            // Mettre à jour le budget existant
            if (currentBudget) {
                const updatedBudget = await tx.budget.update({
                    where: {
                        id: currentBudget.id,
                        userId: user.id,
                    },
                    data: {
                        percentage: percentage,
                    },
                });
                return { category: updatedCategory, budget: updatedBudget };
            }

            // Créer un nouveau budget pour le mois courant
            const newBudget = await tx.budget.create({
                data: {
                    userId: user.id,
                    categoryId: id,
                    month: currentMonth,
                    percentage: percentage,
                },
            });

            return { category: updatedCategory, budget: newBudget };
        });

        revalidatePath("/dashboard")
        revalidatePath("/profile")
        
        return {
            id: result.category.id,
            name: result.category.name,
            budgetId: result.budget?.id || null,
            budgetPercentage: result.budget ? Number(result.budget.percentage) : null
        };
    })

const DeleteCategorySchema = z.object({
    id: z.number().min(1, "L'id de la catégorie est requis"),
})

export const deleteCategoryAction = actionClient
    .inputSchema(DeleteCategorySchema)
    .action(async ({parsedInput: {id}}) => {
        const user = await getRequiredUser()

        const category = await prisma.category.findFirst({
            where: {
                id: id,
                userId: user.id,
            },
            include: {
                budget: true,
                transactions: true,
            }
        });

        if (!category) {
            throw new Error("Catégorie introuvable ou vous n'avez pas les permissions pour la supprimer");
        }

        await prisma.$transaction(async (tx) => {
            await tx.budget.deleteMany({
                where: {
                    categoryId: id,
                    userId: user.id,
                }
            });

            await tx.transaction.updateMany({
                where: {
                    categoryId: id,
                    userId: user.id,
                },
                data: {
                    categoryId: null,
                }
            });

            await tx.category.delete({
                where: {
                    id: id,
                    userId: user.id,
                }
            });
        });

        revalidatePath("/profile");

        return {
            success: true,
            deletedCategoryId: id,
        };
    })

export async function getCategoryData() {
    const user = await getRequiredUser();
    
    // Créer les dates pour le mois courant de manière plus fiable
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based (0 = janvier)
    
    // Premier jour du mois courant à 00:00:00
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    
    // Premier jour du mois suivant à 00:00:00
    const endOfMonth = new Date(year, month + 1, 1, 0, 0, 0, 0);
    
    // Récupérer toutes les entrées (revenus) du mois en cours sans grouper par catégorie
    const totalIncome = await prisma.transaction.aggregate({
        where: {
            userId: user.id,
            type: 'INCOME',
            date: {
                gte: startOfMonth,
                lt: endOfMonth
            }
        },
        _sum: {
            amount: true
        }
    });
    
    // Récupérer les dépenses par catégorie pour le mois en cours
    const expenseTransactions = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
            userId: user.id,
            type: 'EXPENSE',
            date: {
                gte: startOfMonth,
                lt: endOfMonth
            }
        },
        _sum: {
            amount: true
        }
    });
    
    // Créer un Map des dépenses par catégorie (en gérant les categoryId null)
    const expensesByCategory = new Map(
        expenseTransactions
            .filter(t => t.categoryId !== null) // Filtrer les transactions sans catégorie
            .map(t => [t.categoryId!, Math.abs(Number(t._sum.amount)) || 0])
    );
    
    // Récupérer les dépenses sans catégorie
    const uncategorizedExpenses = expenseTransactions
        .filter(t => t.categoryId === null)
        .reduce((sum, t) => sum + (Math.abs(Number(t._sum.amount)) || 0), 0);
    
    return {
        monthIncome: Number(totalIncome._sum.amount) || 0,
        expensesByCategory,
        uncategorizedExpenses,
        currentMonth: {
            startDate: startOfMonth,
            endDate: endOfMonth
        }
    };
}