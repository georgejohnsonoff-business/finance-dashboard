'use client';
import { Transaction } from '@/lib/google-sheets';
import { useState } from 'react';

const TYPE_STYLE: Record<string, string> = {
  Income: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40',
  Expense: 'bg-rose-900/50 text-rose-300 border border-rose-700/40',
  Investment: 'bg-violet-900/50 text-violet-300 border border-violet-700/40',
};

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<'All' | 'Income' | 'Expense' | 'Investment'>('All');
  const [search, setSearch] = useState('');

  const filtered = [...transactions]
    .filter((t) => filter === 'All' || t.type === filter)
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const tabs = ['All', 'Income', 'Expense', 'Investment'] as const;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-slate-100 font-semibold">Recent Transactions</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
          />
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Date', 'Description', 'Category', 'Source', 'Type', 'Amount'].map((h) => (
                <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider pb-3 pr-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-10">
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4 text-slate-400 font-mono text-xs">{t.date}</td>
                  <td className="py-3 pr-4 text-slate-200 max-w-[160px] truncate">
                    {t.description || t.category}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{t.category}</td>
                  <td className="py-3 pr-4 text-slate-400">{t.source || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[t.type]}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`py-3 font-mono font-semibold ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
