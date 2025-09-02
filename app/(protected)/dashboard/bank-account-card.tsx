"use client"

import React from 'react';
import {Card, CardContent} from "@/src/components/ui/card";
import {useRouter} from "next/navigation";
import BankAccountActions from "@/app/(protected)/dashboard/bank-account-actions";

export type SafeBankAccount = {
    id: number;
    name: string;
    initialAmount: number;
    currentAmount: number;
};

const BankAccountCard = (props: {bankAccount: SafeBankAccount}) => {
    const router = useRouter()

    return (
        <Card
            key={props.bankAccount.id}
            className={"hover:bg-gray-100 transition duration-300 max-w-44 min-h-[100px] justify-between cursor-pointer"}
            onClick={() => router.push(`/${props.bankAccount.id}/transactions`)}
        >
            <CardContent className={"flex justify-between gap-4 min-w-44 items-start"}>
                <p className={"text-wrap"}>{props.bankAccount.name}</p>
                <BankAccountActions bankAccountId={props.bankAccount.id} />
            </CardContent>
            <CardContent className={"text-xl font-bold"}>
                {`${props.bankAccount.currentAmount.toString()} €`}
            </CardContent>
        </Card>
    );
};

export default BankAccountCard;