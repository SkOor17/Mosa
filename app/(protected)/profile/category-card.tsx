"use client"

import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";
import AddCategoryButton from "@/src/components/buttons/add-category-button";
import {EditIcon, TrashIcon} from "lucide-react";
import {deleteCategoryAction} from "@/src/lib/action/category-action";
import {SerializableCategoryWithBudget} from "@/src/lib/utils/serialize";
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";
import {UpdateCategoryForm} from "@/src/components/forms/update-category-form";

const CategoryCard = ({ categories }: { categories: SerializableCategoryWithBudget[] }) => {
    return (
        <>
            <Card>
                <CardHeader className={"flex gap-2 justify-between"}>
                    <CardTitle>Mes catégories</CardTitle>
                    <AddCategoryButton/>
                </CardHeader>
                <CardContent className={"flex flex-col gap-2"}>
                    {categories.map((category) => (
                        <div key={category.id} className={"flex justify-between"}>
                            <p >{category.name} - {category.budget[0]?.percentage?.toString() || 0}%</p>
                            <div className={"flex gap-2"}>
                                <ResponsiveModal
                                    title={'Modifier la catégorie'}
                                    trigger={ <EditIcon className={"cursor-pointer"}/> }
                                >
                                    <UpdateCategoryForm
                                        categoryId={category.id}
                                        initialName={category.name}
                                        initialPercentage={category.budget?.[0]?.percentage || 0}
                                    />
                                </ResponsiveModal>
                                <TrashIcon
                                    className={"cursor-pointer"}
                                    onClick={async () => await deleteCategoryAction({id: category.id})}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
    );
};

export default CategoryCard;