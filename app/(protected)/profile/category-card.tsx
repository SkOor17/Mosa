import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";
import AddCategoryButton from "@/src/components/buttons/add-category-button";
import {SerializableCategoryWithBudget} from "@/src/lib/utils/serialize";
import BudgetRow from './budget-row';
import { getCategoryData } from '@/src/lib/action/category-action';

interface CategoryCardProps {
    categories: SerializableCategoryWithBudget[]
    readMode?: boolean
} 

const CategoryCard = async (
    { categories, readMode = false }: CategoryCardProps
) => {
    const { monthIncome, expensesByCategory } = await getCategoryData();
    
    return (
        <Card>
            <CardHeader className={"flex gap-2 justify-between"}>
                <CardTitle>Mes catégories</CardTitle>
                <AddCategoryButton/>
            </CardHeader>
            <CardContent className={"flex flex-col gap-3"}>
                {categories.map((category) => (
                    <BudgetRow 
                        key={category.id} 
                        category={category} 
                        monthIncome={monthIncome}
                        categoryExpense={expensesByCategory.get(category.id) || 0}
                        readMode={readMode}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default CategoryCard;