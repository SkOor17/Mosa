"use client"

import React from 'react';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/src/components/ui/chart";
import {Label, Pie, PieChart} from "recharts";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/src/components/ui/card";

interface ChartDataItem {
    id: number;
    name: string;
    amount: number;
}

interface DonutChartProps {
    data: ChartDataItem[];
    title: string;
    totalLabel?: string;
    currency?: string;
    locale?: string;
}

const DonutChart = ({
    data,
    title,
    totalLabel = "Total",
    currency = "€",
    locale = "fr-FR"
}: DonutChartProps) => {
    if (data.length === 0) return
    
    const chartData = data.map((item, index) => ({
        name: item.name,
        amount: item.amount,
        fill: `var(--chart-${Math.floor(index % 5) + 1})`,
    }));

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    const chartConfig = data.reduce((config, item, index) => ({
        ...config,
        [item.name]: {
            label: item.name,
            color: `var(--chart-${(index % 5) + 1})`,
        },
    }), {
        amount: {
            label: "Montant",
        },
    }) satisfies ChartConfig;

    const formatAmount = (amount: number) => {
        return `${amount.toLocaleString(locale)}${currency}`;
    };

    return (
        <Card className='h-full'>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="amount"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {formatAmount(totalAmount)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {totalLabel}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-4">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm text-muted-foreground">
                            {item.name} ({(item.amount / totalAmount * 100).toFixed(1)}%)
                        </span>
                    </div>
                ))}
            </CardFooter>
        </Card>
    );
};

export default DonutChart;