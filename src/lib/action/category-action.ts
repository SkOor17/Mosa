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