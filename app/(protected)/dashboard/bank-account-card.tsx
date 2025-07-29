"use client"

import React from 'react';
import {Card, CardContent} from "@/src/components/ui/card";

export type SafeBankAccount = {
    id: number;
    name: string;
    type: string;
    initialAmount: number;
    currentAmount: number;
};

const BankAccountCard = (props: {bankAccount: SafeBankAccount}) => {
    return (
        <Card
            key={props.bankAccount.id}
            className={"min-w-44 cursor-pointer hover:bg-gray-100 transition duration-300"}
        >
            <CardContent>{props.bankAccount.name}</CardContent>
            <CardContent className={"text-xl font-bold"}>
                {`${props.bankAccount.currentAmount.toString()} €`}
            </CardContent>
        </Card>
    );
};

export default BankAccountCard;