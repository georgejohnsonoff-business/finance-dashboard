'use client';
import { useEffect, useState, useCallback } from 'react';
import { Transaction } from '@/lib/google-sheets';
import { InvestmentHolding } from '@/lib/investments';
import { NetWorthCards } from '@/components/NetWorthCard';
import { ExpenseChart } from '@/components/ExpenseChart';
import { TransactionTable } from '@/components/TransactionTable';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { FoldLoginCard } from '@/components/FoldLoginCard';
import { InvestmentSummaryCards } from '@/components/InvestmentSummaryCards';
import { InvestmentPortfolio } from '@/components/InvestmentPortfolio';
import { SpendingOverview, Budget } from '@/components/spending/SpendingOverview';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

type Tab = 'overview' | 'transactions' | 'investments';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [investmentTotals, setInvestmentTotals] = useState({ totalInvested: 0, totalCurrentValue: 0, totalGainLoss: 0 });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('overview');

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      setError('');
    } catch {
      setError('Could not load transactions. Check your Google Sheets credentials.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvestments = useCallback(async () => {
    try {
      const res = await fetch('/api/investments');
      if (!res.ok) return;
      const data = await res.json();
      setHoldings(data.holdings ?? []);
      setInvestmentTotals({
        totalInvested: data.totalInvested ?? 0,
        totalCurrentValue: data.totalCurrentValue ?? 0,
        totalGainLoss: data.totalGainLoss ?? 0,
      });
    } catch {}
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch('/api/budgets');
      if (!res.ok) return;
      const data = await res.json();
      setBudgets(data.budgets ?? []);
    } catch {}
  }, []);

  const fetchAll = useCallback(() => {
    fetchTransactions();
    fetchInvestments();
    fetchBudgets();
  }, [fetchTransactions, fetchInvestments, fetchBudgets]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const income = transactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const investments = transactions.filter((t) => t.type === 'Investment').reduce((s, t) => s + t.amount, 0);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'investments', label: 'Investments' },
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="text-slate-100 font-bold text-lg leading-tight">Finance Dashboard</h1>
              <p className="text-slate-500 text-xs">Spending Insights · Live</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    tab === t.key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAll}
              className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>⟳</span> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <FoldLoginCard onConnected={fetchAll} onSync={fetchTransactions} />

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="rounded-xl border border-rose-800 bg-rose-900/20 p-6 text-rose-300 text-sm">
            <p className="font-semibold mb-1">⚠ Connection Error</p>
            <p>{error}</p>
            <p className="mt-2 text-rose-400/70">
              Make sure your .env.local file has the correct GOOGLE_SERVICE_ACCOUNT_EMAIL,
              GOOGLE_PRIVATE_KEY, and GOOGLE_SPREADSHEET_ID values.
            </p>
          </div>
        ) : tab === 'overview' ? (
          <SpendingOverview
            transactions={transactions}
            budgets={budgets}
            onBudgetsChanged={fetchBudgets}
          />
        ) : tab === 'transactions' ? (
          <>
            <NetWorthCards
              totalIncome={income}
              totalExpenses={expenses}
              totalInvestments={investments}
              investmentCurrentValue={investmentTotals.totalCurrentValue}
            />
            <AddTransactionForm onAdded={fetchTransactions} />
            <ExpenseChart transactions={transactions} />
            <TransactionTable transactions={transactions} />
          </>
        ) : (
          <>
            <InvestmentSummaryCards
              totalInvested={investmentTotals.totalInvested}
              totalCurrentValue={investmentTotals.totalCurrentValue}
              totalGainLoss={investmentTotals.totalGainLoss}
            />
            <InvestmentPortfolio holdings={holdings} onAdded={fetchInvestments} />
          </>
        )}
      </div>
    </main>
  );
}
