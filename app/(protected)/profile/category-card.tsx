import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";
import AddCategoryButton from "@/src/components/buttons/add-category-button";
import {SerializableCategoryWithBudget} from "@/src/lib/utils/serialize";
import BudgetRow from './budget-row';
import { getCategoryData } from '@/src/lib/action/category-action';

interface CategoryCardProps {
    categories: SerializableCategoryWithBudget[]
} 

const CategoryCard = async (
    { categories }: CategoryCardProps
) => {
    const { monthIncome, expensesByCategory } = await getCategoryData();
    
    return (
        <Card>
            <CardHeader className={"flex gap-2 justify-between items-center pb-4"}>
                <CardTitle className='text-xl'>Catégories</CardTitle>
                <AddCategoryButton/>
            </CardHeader>
            <CardContent className={"space-y-4"}>
                {categories.map((category) => (
                    <BudgetRow 
                        key={category.id} 
                        category={category} 
                        monthIncome={monthIncome}
                        categoryExpense={expensesByCategory.get(category.id) || 0}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default CategoryCard;