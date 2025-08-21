"use client"

import React from 'react';
import {SquarePlusIcon} from "lucide-react";
import {Button} from "@/src/components/ui/button";
import {AddTransactionForm} from "@/src/components/forms/add-transaction-form";
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";

interface AddTransactionFormProps {
    categories: {
        id: number;
        name: string;
    }[];
    bankAccounts: {
        id: number;
        name: string;
    }[];
}

const AddTransactionButton = ({ categories, bankAccounts }: AddTransactionFormProps) => {
    return (
        <ResponsiveModal
            trigger={
                <Button className={"w-full"}>
                    <SquarePlusIcon/> Nouvelle transaction
                </Button>
            }
            title={'Nouvelle transaction}'}
        >
            <AddTransactionForm categories={categories} bankAccounts={bankAccounts}/>
        </ResponsiveModal>
    );
};

export default AddTransactionButton;