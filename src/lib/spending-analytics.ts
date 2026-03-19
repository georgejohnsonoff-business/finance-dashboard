import { Transaction } from './google-sheets';
import { getCategoryColor } from './categories';

function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

function filterByMonth(txns: Transaction[], year: number, month: number): Transaction[] {
  return txns.filter((t) => {
    const d = parseDate(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function filterExpenses(txns: Transaction[]): Transaction[] {
  return txns.filter((t) => t.type === 'Expense');
}

function filterIncome(txns: Transaction[]): Transaction[] {
  return txns.filter((t) => t.type === 'Income');
}

export interface MonthTotals {
  income: number;
  expenses: number;
  investments: number;
  savings: number;
}

export interface MonthComparison {
  current: MonthTotals;
  previous: MonthTotals;
  incomeChange: number | null;
  expenseChange: number | null;
  savingsChange: number | null;
  savingsRate: number;
  prevSavingsRate: number;
}

function computeTotals(txns: Transaction[]): MonthTotals {
  const income = filterIncome(txns).reduce((s, t) => s + t.amount, 0);
  const expenses = filterExpenses(txns).reduce((s, t) => s + Math.abs(t.amount), 0);
  const investments = txns.filter((t) => t.type === 'Investment').reduce((s, t) => s + Math.abs(t.amount), 0);
  return { income, expenses, investments, savings: income - expenses };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function getMonthComparison(txns: Transaction[], year: number, month: number): MonthComparison {
  const currentTxns = filterByMonth(txns, year, month);
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevTxns = filterByMonth(txns, prevYear, prevMonth);

  const current = computeTotals(currentTxns);
  const previous = computeTotals(prevTxns);

  return {
    current,
    previous,
    incomeChange: pctChange(current.income, previous.income),
    expenseChange: pctChange(current.expenses, previous.expenses),
    savingsChange: pctChange(current.savings, previous.savings),
    savingsRate: current.income > 0 ? (current.savings / current.income) * 100 : 0,
    prevSavingsRate: previous.income > 0 ? (previous.savings / previous.income) * 100 : 0,
  };
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function getCategoryBreakdown(txns: Transaction[], year: number, month: number): CategoryBreakdownItem[] {
  const monthTxns = filterByMonth(filterExpenses(txns), year, month);
  const map = new Map<string, number>();

  for (const t of monthTxns) {
    const cat = t.category || 'Uncategorized';
    map.set(cat, (map.get(cat) ?? 0) + Math.abs(t.amount));
  }

  const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyTrendItem {
  label: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getMonthlyTrend(txns: Transaction[], monthsBack = 12): MonthlyTrendItem[] {
  const now = new Date();
  const result: MonthlyTrendItem[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const totals = computeTotals(filterByMonth(txns, y, m));
    result.push({
      label: `${MONTH_LABELS[m]}`,
      month: m,
      year: y,
      income: totals.income,
      expenses: totals.expenses,
      savings: totals.savings,
    });
  }
  return result;
}

export function getCategoryTrend(txns: Transaction[], category: string, monthsBack = 3): number[] {
  const now = new Date();
  const result: number[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTxns = filterByMonth(filterExpenses(txns), d.getFullYear(), d.getMonth());
    const total = monthTxns
      .filter((t) => t.category === category)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    result.push(total);
  }
  return result;
}

export interface TopMerchantItem {
  name: string;
  amount: number;
  count: number;
}

export function getTopMerchants(txns: Transaction[], year: number, month: number, limit = 10): TopMerchantItem[] {
  const monthTxns = filterByMonth(filterExpenses(txns), year, month);
  const map = new Map<string, { amount: number; count: number }>();

  for (const t of monthTxns) {
    const name = (t.description || t.category || 'Unknown').trim();
    const existing = map.get(name) ?? { amount: 0, count: 0 };
    existing.amount += Math.abs(t.amount);
    existing.count += 1;
    map.set(name, existing);
  }

  return Array.from(map.entries())
    .map(([name, { amount, count }]) => ({ name, amount, count }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export interface DailySpendingItem {
  day: number;
  dayOfWeek: number;
  amount: number;
  isWeekend: boolean;
}

export interface DailySpendingResult {
  days: DailySpendingItem[];
  averageDaily: number;
  totalDays: number;
}

export function getDailySpending(txns: Transaction[], year: number, month: number): DailySpendingResult {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyMap = new Map<number, number>();

  const monthTxns = filterByMonth(filterExpenses(txns), year, month);
  for (const t of monthTxns) {
    const day = parseDate(t.date).getDate();
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + Math.abs(t.amount));
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const days: DailySpendingItem[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    days.push({
      day: d,
      dayOfWeek,
      amount: dailyMap.get(d) ?? 0,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  const totalSpent = days.reduce((s, d) => s + d.amount, 0);
  const averageDaily = maxDay > 0 ? totalSpent / maxDay : 0;

  return { days, averageDaily, totalDays: daysInMonth };
}

export interface DateGroup {
  label: string;
  transactions: Transaction[];
}

export function getDateGroupedTransactions(txns: Transaction[]): DateGroup[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().slice(0, 10);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const groups: Record<string, Transaction[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'This Month': [],
    'Older': [],
  };

  const sorted = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const t of sorted) {
    const d = t.date.slice(0, 10);
    const date = new Date(t.date);
    if (d === today) {
      groups['Today'].push(t);
    } else if (d === yesterday) {
      groups['Yesterday'].push(t);
    } else if (date >= startOfWeek) {
      groups['This Week'].push(t);
    } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      groups['This Month'].push(t);
    } else {
      groups['Older'].push(t);
    }
  }

  return Object.entries(groups)
    .filter(([, txns]) => txns.length > 0)
    .map(([label, transactions]) => ({ label, transactions }));
}
