'use client';
import { useState } from 'react';
import { CategoryBreakdownItem } from '@/lib/spending-analytics';
import { Budget } from './SpendingOverview';
import { BudgetEditForm } from './BudgetEditForm';

function ProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const clamped = Math.min(pct, 100);
  const color = pct < 75 ? 'bg-emerald-500' : pct < 100 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function BudgetTracker({
  budgets,
  categoryBreakdown,
  onBudgetsChanged,
}: {
  budgets: Budget[];
  categoryBreakdown: CategoryBreakdownItem[];
  onBudgetsChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const budgetMap = new Map(budgets.map((b) => [b.category, b.monthlyBudget]));
  const spendMap = new Map(categoryBreakdown.map((c) => [c.category, c.amount]));

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyBudget, 0);
  const totalSpent = categoryBreakdown.reduce((s, c) => s + c.amount, 0);
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const items = budgets
    .filter((b) => b.monthlyBudget > 0)
    .map((b) => ({
      category: b.category,
      budget: b.monthlyBudget,
      spent: spendMap.get(b.category) ?? 0,
    }))
    .sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 font-semibold">Budget</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <BudgetEditForm
          budgets={budgets}
          onSaved={() => {
            setEditing(false);
            onBudgetsChanged();
          }}
        />
      ) : budgets.length === 0 || totalBudget === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-500 text-sm mb-2">No budgets set</p>
          <button
            onClick={() => setEditing(true)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Set Monthly Budgets
          </button>
        </div>
      ) : (
        <>
          {/* Overall */}
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Overall</span>
              <span className={`font-mono ${overallPct > 100 ? 'text-rose-400' : 'text-slate-300'}`}>
                ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <ProgressBar spent={totalSpent} budget={totalBudget} />
            <p className="text-xs text-slate-500 mt-1">{overallPct.toFixed(0)}% used</p>
          </div>

          {/* Per category */}
          <div className="space-y-3">
            {items.map((item) => {
              const pct = (item.spent / item.budget) * 100;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{item.category}</span>
                    <span className={`font-mono ${pct > 100 ? 'text-rose-400' : 'text-slate-300'}`}>
                      ₹{item.spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{item.budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <ProgressBar spent={item.spent} budget={item.budget} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
