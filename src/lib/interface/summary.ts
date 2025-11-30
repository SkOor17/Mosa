export type SummaryDataByYear = {
  year: number;
  total: number;
};

export type SummaryDataByMonth = {
  month: number;
  total: number;
  expensesByCategory: {
    [category: string]: number;
  };
};
