import React, {Suspense} from 'react';
import {prisma} from "@/src/lib/prisma";
import {ChevronLeftIcon, EllipsisVerticalIcon} from "lucide-react";
import Link from "next/link";
import TransactionDataTable from "@/app/(protected)/[bankAccountId]/transactions/transaction-data-table";
import TableSkeleton from "@/app/(protected)/[bankAccountId]/transactions/table-skeleton";

const Page = async (
    {params} : {params: Promise<{bankAccountId: string}>}
) => {
    const { bankAccountId } = await params;

    const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: parseInt(bankAccountId)},
    })

    return (
        <div className={"flex flex-col gap-6"}>
            <div className={"flex justify-between"}>
                <Link href={'/dashboard'}><ChevronLeftIcon /></Link>
                <p>{bankAccount?.name || 'inconnu'} : {bankAccount?.currentAmount.toString()}€</p>
                <EllipsisVerticalIcon/>
            </div>
            <Suspense fallback={<TableSkeleton/>}>
                <TransactionDataTable bankAccountId={parseInt(bankAccountId)}/>
            </Suspense>
        </div>
    );
};

export default Page;