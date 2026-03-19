'use client';
import { useState } from 'react';
import { Budget } from './SpendingOverview';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Rent', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Other',
];

export function BudgetEditForm({
  budgets,
  onSaved,
}: {
  budgets: Budget[];
  onSaved: () => void;
}) {
  const budgetMap = new Map(budgets.map((b) => [b.category, b.monthlyBudget]));

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const cat of EXPENSE_CATEGORIES) {
      init[cat] = String(budgetMap.get(cat) ?? '');
    }
    return init;
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const budgetList: Budget[] = EXPENSE_CATEGORIES
      .filter((cat) => values[cat] && parseFloat(values[cat]) > 0)
      .map((cat) => ({ category: cat, monthlyBudget: parseFloat(values[cat]) }));

    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets: budgetList }),
      });
      onSaved();
    } catch {
      // silent fail
    }
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      {EXPENSE_CATEGORIES.map((cat) => (
        <div key={cat} className="flex items-center gap-3">
          <span className="text-xs text-slate-400 w-28 truncate">{cat}</span>
          <input
            type="number"
            placeholder="0"
            value={values[cat]}
            onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors mt-2"
      >
        {saving ? 'Saving...' : 'Save Budgets'}
      </button>
    </div>
  );
}
