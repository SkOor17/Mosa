import { prisma } from "@/src/lib/prisma";
import { getRequiredUser } from "@/src/lib/auth-session";

/**
 * Assure que tous les budgets existent pour le mois courant
 */
export async function ensureMonthlyBudgets() {
    const user = await getRequiredUser();
    
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const userCategories = await prisma.category.findMany({
        where: {
            userId: user.id
        }
    });

    if (userCategories.length === 0) return

    // Vérifier quels budgets existent déjà pour le mois courant
    const existingBudgets = await prisma.budget.findMany({
        where: {
            userId: user.id,
            month: currentMonth
        }
    });

    const existingCategoryIds = new Set(existingBudgets.map(b => b.categoryId));
    const missingCategories = userCategories.filter(cat => !existingCategoryIds.has(cat.id));

    if (missingCategories.length === 0) return

    // Récupérer les budgets du mois précédent
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousBudgets = await prisma.budget.findMany({
        where: {
            userId: user.id,
            month: previousMonth
        }
    });

    const previousPercentageMap = new Map(
        previousBudgets.map(b => [b.categoryId, Number(b.percentage)])
    );

    // Créer les budgets manquants
    const budgetsToCreate = missingCategories.map(category => ({
        userId: user.id,
        categoryId: category.id,
        month: currentMonth,
        percentage: previousPercentageMap.get(category.id) || 0,
    }));

    if (budgetsToCreate.length > 0) {
        await prisma.budget.createMany({
            data: budgetsToCreate
        });
    }
}