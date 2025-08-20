import DonutChart from "@/src/components/ui/donut-chart";

interface ExpenseCategory {
    id: number;
    name: string;
    totalExpense: number;
}

export const SummaryExpenseChart = (
    { expenseCategories }: { expenseCategories: ExpenseCategory[] }
) => {
    const chartData = expenseCategories.map(category => ({
        id: category.id,
        name: category.name,
        amount: category.totalExpense
    }));

    return (
        <DonutChart
            data={chartData}
            title="Dépenses par catégorie"
            totalLabel="Total dépensé"
        />
    );
};