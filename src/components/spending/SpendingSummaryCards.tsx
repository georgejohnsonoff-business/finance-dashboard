'use client';
import { MonthComparison } from '@/lib/spending-analytics';

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-slate-500">New</span>;
  const isUp = value > 0;
  const color = isUp ? 'text-rose-400' : 'text-emerald-400';
  return (
    <span className={`text-xs font-medium ${color}`}>
      {isUp ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function SavingsChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-slate-500">New</span>;
  const isUp = value > 0;
  const color = isUp ? 'text-emerald-400' : 'text-rose-400';
  return (
    <span className={`text-xs font-medium ${color}`}>
      {isUp ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function SpendingSummaryCards({ data }: { data: MonthComparison }) {
  const cards = [
    {
      title: 'Monthly Spend',
      value: data.current.expenses,
      change: data.expenseChange,
      color: 'text-rose-400',
      bg: 'from-rose-900/20 to-transparent',
      border: 'border-rose-800/40',
      icon: '🔥',
      invertChange: true,
    },
    {
      title: 'Monthly Income',
      value: data.current.income,
      change: data.incomeChange,
      color: 'text-emerald-400',
      bg: 'from-emerald-900/20 to-transparent',
      border: 'border-emerald-800/40',
      icon: '💰',
      invertChange: false,
    },
    {
      title: 'Savings',
      value: Math.max(0, data.current.savings),
      change: data.savingsChange,
      color: 'text-cyan-400',
      bg: 'from-cyan-900/20 to-transparent',
      border: 'border-cyan-800/40',
      icon: '🏦',
      invertChange: false,
    },
    {
      title: 'Savings Rate',
      value: data.savingsRate,
      change: data.savingsRate - data.prevSavingsRate,
      color: data.savingsRate >= 20 ? 'text-emerald-400' : data.savingsRate >= 0 ? 'text-amber-400' : 'text-rose-400',
      bg: data.savingsRate >= 20 ? 'from-emerald-900/20 to-transparent' : 'from-amber-900/20 to-transparent',
      border: data.savingsRate >= 20 ? 'border-emerald-800/40' : 'border-amber-800/40',
      icon: '📊',
      isPercent: true,
      invertChange: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`rounded-xl border ${c.border} bg-gradient-to-br ${c.bg} bg-slate-900 p-5`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{c.title}</span>
            <span className="text-lg">{c.icon}</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${c.color}`}>
            {'isPercent' in c && c.isPercent
              ? `${c.value.toFixed(1)}%`
              : `₹${Math.abs(c.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          </p>
          <div className="mt-1">
            {c.invertChange ? (
              <ChangeBadge value={c.change} />
            ) : (
              <SavingsChangeBadge value={c.change} />
            )}
            <span className="text-xs text-slate-600 ml-1">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
