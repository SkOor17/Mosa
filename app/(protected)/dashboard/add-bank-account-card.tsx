"use client"

import React from 'react';
import {SquarePlusIcon} from "lucide-react";
import {Card, CardContent} from "@/src/components/ui/card";
import { AddBankAccountForm } from "@/src/components/forms/add-bank-account-form";
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";

const AddBankAccountCard = () => {

    return (
        <ResponsiveModal
            trigger={
                <Card className="w-44 min-w-44 cursor-pointer hover:bg-gray-100 transition duration-300">
                    <CardContent className={"h-[100px] flex justify-center items-center"}>
                        <SquarePlusIcon/>
                    </CardContent>
                </Card>
            }
            title={'Nouveau compte bancaire'}
        >
            <AddBankAccountForm />
        </ResponsiveModal>
    );
};

export default AddBankAccountCard;