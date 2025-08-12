"use client"

import React, { useState } from 'react';
import {SquarePlusIcon, XIcon} from "lucide-react";
import {Card, CardContent} from "@/src/components/ui/card";
import {
    AlertDialog,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/src/components/ui/alert-dialog";
import { AddBankAccountForm } from "@/src/components/forms/add-bank-account-form";

const AddBankAccountCard = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger>
                <Card className="w-44 cursor-pointer hover:bg-gray-100 transition duration-300">
                    <CardContent className={"h-[100px] flex justify-center items-center"}>
                        <SquarePlusIcon/>
                    </CardContent>
                </Card>
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
                <AddBankAccountForm />
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddBankAccountCard;