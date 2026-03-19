'use client';
import { useState } from 'react';

const CATEGORIES = [
  'Food & Dining', 'Rent', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Salary', 'Freelance', 'Mutual Funds',
  'Stocks', 'SIP', 'Other',
];

const SOURCES = ['GPay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Bank Transfer', 'Cash', 'Credit Card', 'Debit Card'];

const TYPES = ['Expense', 'Income', 'Investment'] as const;

type TxType = (typeof TYPES)[number];

const TYPE_COLOR: Record<TxType, string> = {
  Expense: 'bg-rose-600 hover:bg-rose-500',
  Income: 'bg-emerald-600 hover:bg-emerald-500',
  Investment: 'bg-violet-600 hover:bg-violet-500',
};

export function AddTransactionForm({ onAdded }: { onAdded: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today,
    amount: '',
    category: '',
    description: '',
    source: '',
    type: 'Expense' as TxType,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [open, setOpen] = useState(true);

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    setLoading(true);
    const amount =
      form.type === 'Expense'
        ? -Math.abs(parseFloat(form.amount))
        : Math.abs(parseFloat(form.amount));

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount }),
      });
      if (res.ok) {
        setMsg({ text: '✓ Transaction saved to Google Sheets!', ok: true });
        setForm({ date: today, amount: '', category: '', description: '', source: '', type: 'Expense' });
        onAdded();
      } else {
        setMsg({ text: '✗ Error saving. Check console.', ok: false });
      }
    } catch {
      setMsg({ text: '✗ Network error.', ok: false });
    }

    setLoading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 mb-6 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">➕</span>
          <span className="text-slate-100 font-semibold">Add Transaction</span>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 border-t border-slate-800 pt-4">
          {/* Type selector */}
          <div className="flex gap-2 mb-4">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update('type', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.type === t ? TYPE_COLOR[t] + ' text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Source / App</label>
              <select
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select source…</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Description (optional)</label>
              <input
                type="text"
                placeholder="e.g. Lunch at Zomato, EMI payment…"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Saving…' : 'Save to Sheet'}
            </button>
            {msg && (
              <span className={`text-sm ${msg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                {msg.text}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
