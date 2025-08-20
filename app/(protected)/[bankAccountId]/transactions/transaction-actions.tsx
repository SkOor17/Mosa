"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import {EditIcon, MoreHorizontal, TrashIcon} from "lucide-react";
import {Button} from "@/src/components/ui/button";
import {useRouter} from "next/navigation";
import {removeTransactionsAction} from "@/src/lib/action/transaction-actions";
import {TransactionType} from "@/app/generated/prisma";
import React from "react";

export type TransactionRow = {
    id: number
    bankAccount: string;
    category: string;
    amount: string;
    type: TransactionType;
    description: string | null;
    date: string;
}

type TransactionActionProps = {
    transaction: TransactionRow
    onEdit: (transaction: TransactionRow) => void // Nouveau prop
}

export function TransactionActions({
   transaction,
   onEdit
}: TransactionActionProps) {
    const router = useRouter();

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(transaction);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await removeTransactionsAction({ids: [transaction.id]});
        router.refresh();
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleDelete}>
                        <TrashIcon className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEdit}>
                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}