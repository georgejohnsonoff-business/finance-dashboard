'use client';
import { useState, useMemo } from 'react';
import { Transaction } from '@/lib/google-sheets';
import {
  getMonthComparison, getCategoryBreakdown, getMonthlyTrend,
  getCategoryTrend, getTopMerchants, getDailySpending,
} from '@/lib/spending-analytics';
import { SpendingSummaryCards } from './SpendingSummaryCards';
import { CategoryDonutChart } from './CategoryDonutChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { TopCategoriesRanking } from './TopCategoriesRanking';
import { TopMerchants } from './TopMerchants';
import { DailySpendingChart } from './DailySpendingChart';
import { BudgetTracker } from './BudgetTracker';

export interface Budget {
  category: string;
  monthlyBudget: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function SpendingOverview({
  transactions,
  budgets,
  onBudgetsChanged,
}: {
  transactions: Transaction[];
  budgets: Budget[];
  onBudgetsChanged: () => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const comparison = useMemo(() => getMonthComparison(transactions, year, month), [transactions, year, month]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(transactions, year, month), [transactions, year, month]);
  const totalExpenses = useMemo(() => categoryBreakdown.reduce((s, c) => s + c.amount, 0), [categoryBreakdown]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(transactions, 12), [transactions]);
  const topMerchants = useMemo(() => getTopMerchants(transactions, year, month), [transactions, year, month]);
  const dailySpending = useMemo(() => getDailySpending(transactions, year, month), [transactions, year, month]);

  const categoryTrends = useMemo(() => {
    const trends: Record<string, number[]> = {};
    for (const item of categoryBreakdown) {
      trends[item.category] = getCategoryTrend(transactions, item.category, 3);
    }
    return trends;
  }, [transactions, categoryBreakdown]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  return (
    <div>
      {/* Month Picker */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={prevMonth} className="text-slate-400 hover:text-slate-200 transition-colors text-lg px-2">
          ‹
        </button>
        <span className="text-slate-100 font-semibold text-lg min-w-[180px] text-center">
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} className="text-slate-400 hover:text-slate-200 transition-colors text-lg px-2">
          ›
        </button>
      </div>

      {/* Summary Cards */}
      <SpendingSummaryCards data={comparison} />

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <CategoryDonutChart
            data={categoryBreakdown}
            total={totalExpenses}
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
          <BudgetTracker
            budgets={budgets}
            categoryBreakdown={categoryBreakdown}
            onBudgetsChanged={onBudgetsChanged}
          />
        </div>

        {/* Right Column */}
        <div>
          <MonthlyTrendChart data={monthlyTrend} />
          <DailySpendingChart data={dailySpending} />
        </div>
      </div>

      {/* Full-width bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCategoriesRanking data={categoryBreakdown} trends={categoryTrends} />
        <TopMerchants data={topMerchants} />
      </div>
    </div>
  );
}
