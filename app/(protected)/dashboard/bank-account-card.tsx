"use client"

import React from 'react';
import {Card, CardContent} from "@/src/components/ui/card";
import {EditIcon, EllipsisVerticalIcon, TrashIcon} from "lucide-react";
import {removeBankAccountAction} from "@/src/lib/action/bank-account-actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import {useRouter} from "next/navigation";

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
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <EllipsisVerticalIcon size={20} className={"cursor-pointer"}/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={10}>
                            <DropdownMenuItem
                                onClick={async () => await removeBankAccountAction({id: props.bankAccount.id})}
                                className={"cursor-pointer"}
                            >
                                <TrashIcon/>
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <EditIcon/>
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
            <CardContent className={"text-xl font-bold"}>
                {`${props.bankAccount.currentAmount.toString()} €`}
            </CardContent>
        </Card>
    );
};

export default BankAccountCard;