"use client"

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import {EditIcon, EllipsisVerticalIcon, TrashIcon} from "lucide-react";
import {removeBankAccountAction} from "@/src/lib/action/bank-account-actions";
import {usePathname, useRouter} from "next/navigation";

const BankAccountActions = (
    {bankAccountId} :
    {bankAccountId: number}
) => {
    const pathName = usePathname()
    const router = useRouter()

    const handleDelete = async () => {
        await removeBankAccountAction({id: bankAccountId})
        if (pathName !== '/dashboard') router.push('/dashboard')
    }

    return (
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
                        onClick={handleDelete}
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
    );
};

export default BankAccountActions;