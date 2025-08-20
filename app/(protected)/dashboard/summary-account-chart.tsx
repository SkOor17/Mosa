"use client"

import React from 'react';
import DonutChart from "@/src/components/ui/donut-chart";

interface BankAccount {
    id: number;
    name: string;
    currentAmount: number;
}

// Composant pour les comptes bancaires
const SummaryAccountChart = ({ bankAccounts }: { bankAccounts: BankAccount[] }) => {
    const chartData = bankAccounts.map(account => ({
        id: account.id,
        name: account.name,
        amount: account.currentAmount
    }));

    return (
        <DonutChart
            data={chartData}
            title="Total des comptes"
            totalLabel="Total"
        />
    );
};

export default SummaryAccountChart;