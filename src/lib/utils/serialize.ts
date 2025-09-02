import {Prisma} from "@/app/generated/prisma";
import CategoryGetPayload = Prisma.CategoryGetPayload;

type PrismaCategoryWithBudget = CategoryGetPayload<{
    include: { budget: true }
}>

export type SerializableCategoryWithBudget = {
    id: number
    name: string
    userId: string
    budget: {
        id: number
        userId: string
        categoryId: number
        month: string
        percentage: number
    }[]
}

export function serializeCategory(
    category: PrismaCategoryWithBudget
): SerializableCategoryWithBudget {
    return {
        id: category.id,
        name: category.name,
        userId: category.userId,
        budget: category.budget.map(budget => ({
            id: budget.id,
            userId: budget.userId,
            categoryId: budget.categoryId,
            month: budget.month.toISOString(),
            percentage: Number(budget.percentage)
        }))
    }
}