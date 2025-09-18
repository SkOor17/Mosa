import React from 'react';
import SafeBankAccount from '@/src/lib/interface/safe-banck-account';
import BankAccountCardClient from './bank-account-card-client';
import { prisma } from '@/src/lib/prisma';

interface BankAccountCardProps {
    bankAccount: SafeBankAccount
}

const BankAccountCard = async ({bankAccount}: BankAccountCardProps) => {
    const monthTransactions = await prisma.transaction.aggregate({
        _sum: {
            amount: true
        },
        where: {
            bankAccountId: bankAccount.id,
            date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        }
    })

    const monthAmount = Number(monthTransactions._sum.amount || 0);
    const previousAmount = bankAccount.currentAmount - monthAmount
    const percentageChange = previousAmount > 0 ? Math.round((monthAmount / previousAmount) * 100) : 0

    return (
        <BankAccountCardClient 
            bankAccount={bankAccount} 
            percentageChange={percentageChange}        
        />
    );
};

export default BankAccountCard;