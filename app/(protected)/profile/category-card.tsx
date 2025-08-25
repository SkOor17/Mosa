"use client"

import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";
import AddCategoryButton from "@/src/components/buttons/add-category-button";
import {TrashIcon} from "lucide-react";
import {deleteCategoryAction} from "@/src/lib/action/category-action";
import {SerializableCategoryWithBudget} from "@/src/lib/utils/serialize";

interface ClientComponentProps {
    categories: SerializableCategoryWithBudget[]
}

const CategoryCard = ({ categories }: ClientComponentProps) => {
    return (
        <Card>
            <CardHeader className={"flex gap-2 justify-between"}>
                <CardTitle>Mes catégories</CardTitle>
                <AddCategoryButton/>
            </CardHeader>
            <CardContent className={"flex flex-col gap-2"}>
                {categories.map((category) => (
                    <div key={category.id} className={"flex justify-between"}>
                        <p >{category.name} - {category.budget[0]?.percentage?.toString() || 0}%</p>
                        <TrashIcon
                            className={"cursor-pointer"}
                            onClick={async () => await deleteCategoryAction({id: category.id})}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default CategoryCard;