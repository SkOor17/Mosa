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
import { getSummaryDataByMonth, getSummaryDataByYear } from "@/src/lib/action/summary-action";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from "@/src/components/ui/card";
import {SummaryDataByMonth, SummaryDataByYear} from "@/src/lib/interface/summary";

type View = "month" | "year";

export default function SummaryPage() {
  const [view, setView] = useState<View>("month");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [yearData, setYearData] = useState<SummaryDataByYear[]>([]);
  const [monthData, setMonthData] = useState<SummaryDataByMonth[]>([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(year, i).toLocaleString('default', { month: 'long' }) }));


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

  const yearChartData = yearData.map((d) => ({ date: d.year.toString(), "Total Balance": d.total }));
  const monthChartData = monthData.map((d) => ({ date: new Date(year, d.month).toLocaleString('default', { month: 'short' }), "Total Balance": d.total }));

  const categoryData = view === "month" && monthData.length > 0
    ? Object.entries(monthData[month]?.expensesByCategory || {}).map(([category, total]) => ({ category, total }))
    : [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
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
        <div className="flex items-center gap-2">
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
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={view === 'year' ? yearChartData : monthChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            content={({ active, payload, label }) =>
                                active && payload && payload.length ? (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                  Date
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                  {label}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                  Total
                                                </span>
                                                <span className="font-bold">
                                                  {payload[0].value}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            }
                        />
                        <Area type="monotone" dataKey="Total Balance" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

      {view === "month" && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category - {months[month].label} {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                    content={({ active, payload, label }) =>
                        active && payload && payload.length ? (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Category
                                        </span>
                                        <span className="font-bold text-muted-foreground">
                                          {label}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Total
                                        </span>
                                        <span className="font-bold">
                                          {payload[0].value}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    }
                />
                <Bar dataKey="total" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
