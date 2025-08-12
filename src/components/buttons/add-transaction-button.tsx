"use client"

import React, {useState} from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/src/components/ui/alert-dialog";
import {SquarePlusIcon, XIcon} from "lucide-react";
import {Button} from "@/src/components/ui/button";
import {AddTransactionForm} from "@/src/components/forms/add-transaction-form";

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
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button className={"w-full"}>
                    <SquarePlusIcon/> Nouvelle transaction
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={"flex justify-between"}>
                        Nouvelle transaction
                        <XIcon
                            className={"cursor-pointer"}
                            onClick={() => setIsOpen(false)}
                        />
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AddTransactionForm categories={categories} bankAccounts={bankAccounts}/>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddTransactionButton;