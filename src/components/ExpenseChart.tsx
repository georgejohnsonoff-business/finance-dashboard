'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Transaction } from '@/lib/google-sheets';
import { useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

function buildMonthlyData(transactions: Transaction[]) {
  return MONTHS.map((month, idx) => {
    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === idx && d.getFullYear() === currentYear;
    });
    return {
      month,
      Expenses: Math.abs(monthly.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)),
      Income: monthly.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
      Invested: Math.abs(monthly.filter((t) => t.type === 'Investment').reduce((s, t) => s + t.amount, 0)),
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export function ExpenseChart({ transactions }: { transactions: Transaction[] }) {
  const [view, setView] = useState<'bar' | 'line'>('bar');
  const data = buildMonthlyData(transactions);

  const tabs = [
    { key: 'bar', label: 'Bar' },
    { key: 'line', label: 'Trend' },
  ] as const;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-slate-100 font-semibold">Monthly Overview</h2>
          <p className="text-slate-500 text-xs mt-0.5">{currentYear}</p>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                view === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {view === 'bar' ? (
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                   tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Expenses" radius={[3, 3, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === currentMonth ? '#6366f1' : '#3b4054'} />
              ))}
            </Bar>
            <Bar dataKey="Invested" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                   tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Expenses" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Invested" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
