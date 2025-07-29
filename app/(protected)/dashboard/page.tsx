import React from 'react';
import {getUser} from "@/src/lib/auth-session";
import {Button} from "@/src/components/ui/button";
import {SquarePlusIcon} from "lucide-react";
import {prisma} from "@/src/lib/prisma";
import {Card} from "@/src/components/ui/card";
import BankAccountCard from "@/app/(protected)/dashboard/bank-account-card";
import AddBankAccountCard from "@/app/(protected)/dashboard/add-bank-account-card";

const Dashboard = async () => {
    const user = await getUser()

    const bankAccounts = await prisma.bankAccountUser.findMany({
        where: {
            userId: user?.id
        },
        include: {
            bankAccount: true
        }
    })

    return (
        <div className={"flex flex-col gap-6 pt-6"}>
            <div className={"flex flex-col gap-4"}>
                <div>
                    <h2 className={"text-xl font-semibold"}>Dashboard</h2>
                    <p className={"text-sm text-gray-600"}>{"Vue d'ensemble"}</p>
                </div>
                <Button>
                    <SquarePlusIcon/> Nouvelle transaction
                </Button>
            </div>
            <div className={"flex flex-col gap-4"}>
                <h2 className={"text-xl font-semibold"}>Comptes</h2>
                <div className={"flex gap-4 overflow-auto max-w-full pb-4"}>
                    {bankAccounts.map((bankAccount) => {
                        const safeBankAccount = {
                            ...bankAccount.bankAccount,
                            initialAmount: bankAccount.bankAccount.initialAmount.toNumber(),
                            currentAmount: bankAccount.bankAccount.currentAmount.toNumber(),
                        }

                        return (
                            <BankAccountCard
                                key={bankAccount.id}
                                bankAccount={safeBankAccount}
                            />
                        )
                    })}
                    <AddBankAccountCard/>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;