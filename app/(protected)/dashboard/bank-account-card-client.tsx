"use client"

import { Card, CardContent } from "@/src/components/ui/card"
import SafeBankAccount from "@/src/lib/interface/safe-banck-account"
import { useRouter } from "next/navigation"
import BankAccountActions from "./bank-account-actions"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

interface BankAccountCardClientProps {
    bankAccount: SafeBankAccount
    percentageChange: number
}

const BankAccountCardClient = ({bankAccount, percentageChange}: BankAccountCardClientProps) => {
    const router = useRouter()

    return (
        <Card
            key={bankAccount.id}
            className={"hover:bg-gray-100 transition duration-300 max-w-44 min-h-[100px] justify-between cursor-pointer"}
            onClick={() => router.push(`/${bankAccount.id}/transactions`)}
        >
            <CardContent className={"flex justify-between gap-4 min-w-44 items-start"}>
                <p className={"text-wrap"}>{bankAccount.name}</p>
                <BankAccountActions bankAccountId={bankAccount.id} />
            </CardContent>
            <CardContent>
                <p className={"text-xl font-bold"}>
                    {`${bankAccount.currentAmount.toString()} €`}
                </p>
                {percentageChange > 0 
                    ? (
                        <p className={'flex gap-1 items-center text-sm text-green-700'}>
                            <TrendingUpIcon size={16}/> +{percentageChange} %
                        </p>
                    )
                    : (
                        <p className={'flex gap-1 items-center text-sm text-red-700'}>
                            <TrendingDownIcon size={16}/> {percentageChange} %
                        </p>
                    )
                }
            </CardContent>
        </Card>
    );
}

export default BankAccountCardClient