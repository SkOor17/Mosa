"use client"

import React from 'react';
import {Button} from "@/src/components/ui/button";
import {PlusIcon} from "lucide-react";
import {AddCategoryForm} from "@/src/components/forms/add-category-form";
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";

const AddCategoryButton = () => {
    return (
        <ResponsiveModal
            trigger={
                <Button className={"w-fit"}>
                    <PlusIcon/> Nouvelle Categorie
                </Button>
            }
            title={'Nouvelle Categorie'}
        >
            <AddCategoryForm/>
        </ResponsiveModal>
    );
};

export default AddCategoryButton;