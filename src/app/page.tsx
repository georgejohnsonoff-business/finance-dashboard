'use client';
import { useEffect, useState, useCallback } from 'react';
import { Transaction } from '@/lib/google-sheets';
import { NetWorthCards } from '@/components/NetWorthCard';
import { ExpenseChart } from '@/components/ExpenseChart';
import { TransactionTable } from '@/components/TransactionTable';
import { AddTransactionForm } from '@/components/AddTransactionForm';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const income = transactions
    .filter((t) => t.type === 'Income')
    .reduce((s, t) => s + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((s, t) => s + t.amount, 0);

  const investments = transactions
    .filter((t) => t.type === 'Investment')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="text-slate-100 font-bold text-lg leading-tight">Finance Dashboard</h1>
              <p className="text-slate-500 text-xs">Google Sheets · Real-time</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5 transition-colors"
          >
            <span>⟳</span> Refresh
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
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
        ) : (
          <>
            <NetWorthCards
              totalIncome={income}
              totalExpenses={expenses}
              totalInvestments={investments}
            />
            <AddTransactionForm onAdded={fetchData} />
            <ExpenseChart transactions={transactions} />
            <TransactionTable transactions={transactions} />
          </>
        )}
      </div>
    </main>
  );
}
