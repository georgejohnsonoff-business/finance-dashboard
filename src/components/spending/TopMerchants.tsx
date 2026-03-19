'use client';
import { TopMerchantItem } from '@/lib/spending-analytics';

export function TopMerchants({ data }: { data: TopMerchantItem[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <h3 className="text-slate-100 font-semibold mb-4">Top Merchants</h3>
      {data.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No data</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-mono w-4">{i + 1}</span>
              <span className="text-sm text-slate-300 flex-1 truncate">{item.name}</span>
              <span className="text-xs text-slate-500">{item.count}x</span>
              <span className="text-xs font-mono text-slate-200 w-20 text-right">
                ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
