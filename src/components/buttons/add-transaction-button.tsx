"use client"

import React from 'react';
import {SquarePlusIcon} from "lucide-react";
import {Button} from "@/src/components/ui/button";
import {AddTransactionForm} from "@/src/components/forms/add-transaction-form";
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";
import { cn } from '@/src/lib/utils';

interface AddTransactionFormProps {
    categories: {
        id: number;
        name: string;
    }[];
    bankAccounts: {
        id: number;
        name: string;
    }[];
    widthFull?: boolean;
}

const AddTransactionButton = ({ categories, bankAccounts, widthFull }: AddTransactionFormProps) => {
    return (
        <ResponsiveModal
            trigger={
                <Button className={cn(widthFull && 'w-full')}>
                    <SquarePlusIcon/> Nouvelle transaction
                </Button>
            }
            title={'Nouvelle transaction'}
        >
            <AddTransactionForm categories={categories} bankAccounts={bankAccounts}/>
        </ResponsiveModal>
    );
};

export default AddTransactionButton;