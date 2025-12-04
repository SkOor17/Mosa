import React from "react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type ChartDataItem = {
  dataKey: string;
  balance: number;
} 

interface BarChartProps {
  data: ChartDataItem[];
}

export default function BarChartCustom({data} : BarChartProps) {
  const barChartConfig = {
    balance: {
      label: "Total Balance",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={barChartConfig}
      className="min-h-[300px] h-[400px] w-full"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="dataKey"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="balance" fill="var(--color-balance)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
