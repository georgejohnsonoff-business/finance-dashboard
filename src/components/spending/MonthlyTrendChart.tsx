'use client';
import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { MonthlyTrendItem } from '@/lib/spending-analytics';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-300 text-xs font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: ₹{Math.abs(p.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrendItem[] }) {
  const [view, setView] = useState<'bar' | 'line'>('bar');

  const chartData = data.map((d) => ({
    ...d,
    expenses: d.expenses,
    income: d.income,
    savings: Math.max(0, d.savings),
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 font-semibold">Monthly Trend</h3>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setView('bar')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              view === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setView('line')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              view === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trend
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {view === 'bar' ? (
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#22c55e" radius={[3, 3, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#6366f1" radius={[3, 3, 0, 0]} name="Expenses" />
            <Bar dataKey="savings" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Savings" />
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2} dot={false} name="Expenses" />
            <Line type="monotone" dataKey="savings" stroke="#06b6d4" strokeWidth={2} dot={false} name="Savings" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
