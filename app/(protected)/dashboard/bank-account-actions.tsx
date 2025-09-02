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
import {ResponsiveModal} from "@/src/components/ui/responsive-modal";
import {UpdateBankAccountForm} from "@/src/components/forms/update-banck-account-form";

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
                <DropdownMenuContent sideOffset={10} align={'end'}>
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className={"cursor-pointer"}
                    >
                        <TrashIcon/>
                        Delete
                    </DropdownMenuItem>
                    <ResponsiveModal
                        title={'Modifie ton compte bancaire'}
                        trigger={
                            <DropdownMenuItem
                                className={"cursor-pointer"}
                                onSelect={(e) => e.preventDefault()}
                            >
                                    <EditIcon/>
                                    Edit
                            </DropdownMenuItem>
                        }
                    >
                        <UpdateBankAccountForm accountId={bankAccountId}/>
                    </ResponsiveModal>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default BankAccountActions;