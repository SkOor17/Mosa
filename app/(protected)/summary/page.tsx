"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  getSummaryDataByMonth,
  getSummaryDataByYear,
} from "@/src/lib/action/summary-action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  SummaryDataByMonth,
  SummaryDataByYear,
} from "@/src/lib/interface/summary";
import DonutChart from "@/src/components/charts/donut-chart";
import BarChartCustom from "@/src/components/charts/bar-chart-custom";

type View = "month" | "year";

export default function SummaryPage() {
  const [view, setView] = useState<View>("month");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [yearData, setYearData] = useState<SummaryDataByYear[]>([]);
  const [monthData, setMonthData] = useState<SummaryDataByMonth[]>([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(year, i).toLocaleString("default", { month: "long" }),
  }));

  useEffect(() => {
    async function fetchData() {
      if (view === "year") {
        const result = await getSummaryDataByYear();
        if (result && result.data) {
          setYearData(result.data.data);
        }
      } else {
        const result = await getSummaryDataByMonth({ year });
        if (result && result.data) {
          setMonthData(result.data.data);
        }
      }
    }

    fetchData();
  }, [view, year]);

  const yearChartData = yearData.map((d) => ({
    dataKey: d.year.toString(),
    balance: d.total,
  }));
  
  const monthBarChartData = monthData.map((d) => ({
    dataKey: new Date(year, d.month).toLocaleString("default", { month: "short" }),
    balance: d.total,
  }));

  const categoryData =
    view === "month" && monthData.length > 0
      ? Object.entries(monthData[month]?.expensesByCategory || {}).map(
          ([category, total], index) => ({ id: index, name: category, amount: total })
        )
      : [];

  // TODO: Déplacer la logique du graphique annuel et mensuel dans un autre composant 
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-2 md:gap-0 md:flex-row items-start md:items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setView("month")}
            variant={view === "month" ? "default" : "outline"}
          >
            Month
          </Button>
          <Button
            onClick={() => setView("year")}
            variant={view === "year" ? "default" : "outline"}
          >
            Year
          </Button>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2">
          {view === "month" && (
            <Select
              value={month.toString()}
              onValueChange={(value) => setMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={year.toString()}
            onValueChange={(value) => setYear(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Total Balance Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartCustom
            data={view === 'month' ? monthBarChartData : yearChartData}
          />
        </CardContent>
      </Card>

      {view === "month" && (
        <DonutChart
          data={categoryData}
          title={`Expenses by Category - ${months[month].label} ${year}`}
          totalLabel="Total dépensé"
        />
      )}
    </div>
  );
}
