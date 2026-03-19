'use client';
import { useState } from 'react';
import { InvestmentHolding } from '@/lib/investments';

const TYPE_BADGE: Record<string, string> = {
  MF: 'bg-violet-900/50 text-violet-300 border border-violet-700/40',
  Stock: 'bg-amber-900/50 text-amber-300 border border-amber-700/40',
};

export function InvestmentPortfolio({
  holdings,
  onAdded,
}: {
  holdings: InvestmentHolding[];
  onAdded: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'MF' as 'MF' | 'Stock',
    name: '',
    schemeCodeOrTicker: '',
    units: '',
    avgBuyPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.schemeCodeOrTicker || !form.units) return;
    setLoading(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          units: parseFloat(form.units),
          avgBuyPrice: parseFloat(form.avgBuyPrice) || 0,
        }),
      });
      if (res.ok) {
        setMsg({ text: 'Holding added!', ok: true });
        setForm({ type: 'MF', name: '', schemeCodeOrTicker: '', units: '', avgBuyPrice: '' });
        onAdded();
      } else {
        setMsg({ text: 'Failed to save', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error', ok: false });
    }
    setLoading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-slate-100 font-semibold">Holdings</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
        >
          {showForm ? '— Hide' : '+ Add Holding'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-lg border border-slate-800 bg-slate-800/30">
          <div className="flex gap-2 mb-3">
            {(['MF', 'Stock'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update('type', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'MF'
                      ? 'bg-violet-600 text-white'
                      : 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'MF' ? 'Mutual Fund' : 'Stock'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Nifty 50 Index Fund"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                {form.type === 'MF' ? 'Scheme Code' : 'Ticker (e.g. RELIANCE.NS)'}
              </label>
              <input
                type="text"
                placeholder={form.type === 'MF' ? '119551' : 'RELIANCE.NS'}
                value={form.schemeCodeOrTicker}
                onChange={(e) => update('schemeCodeOrTicker', e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Units</label>
              <input
                type="number"
                placeholder="100"
                value={form.units}
                onChange={(e) => update('units', e.target.value)}
                required
                step="any"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Avg Buy Price (₹)</label>
              <input
                type="number"
                placeholder="150.00"
                value={form.avgBuyPrice}
                onChange={(e) => update('avgBuyPrice', e.target.value)}
                step="any"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Add Holding'}
            </button>
            {msg && (
              <span className={`text-sm ${msg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{msg.text}</span>
            )}
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Name', 'Type', 'Units', 'Avg Buy', 'Live Price', 'Value', 'P&L'].map((h) => (
                <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider pb-3 pr-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-slate-500 py-10">
                  No holdings yet. Add your first investment above.
                </td>
              </tr>
            ) : (
              holdings.map((h) => (
                <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4 text-slate-200 max-w-[180px] truncate">
                    {h.name || h.schemeCodeOrTicker}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[h.type]}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300 font-mono">{h.units.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-slate-400 font-mono">₹{h.avgBuyPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-slate-200 font-mono">₹{h.livePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-3 pr-4 text-slate-200 font-mono font-semibold">
                    ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-3 font-mono font-semibold ${h.gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {h.gainLoss >= 0 ? '+' : ''}₹{Math.abs(h.gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    <span className="text-xs ml-1 opacity-70">({h.gainLossPercent.toFixed(1)}%)</span>
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
