'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CategoryBreakdownItem } from '@/lib/spending-analytics';
import { getCategoryIcon } from '@/lib/categories';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div style={{ width: 48, height: 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopCategoriesRanking({
  data,
  trends,
}: {
  data: CategoryBreakdownItem[];
  trends: Record<string, number[]>;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <h3 className="text-slate-100 font-semibold mb-4">Top Categories</h3>
      {data.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No data</p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 8).map((item, i) => (
            <div key={item.category} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-mono w-4">{i + 1}</span>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm flex-shrink-0">{getCategoryIcon(item.category)}</span>
              <span className="text-sm text-slate-300 flex-1 truncate">{item.category}</span>
              {trends[item.category] && (
                <Sparkline data={trends[item.category]} color={item.color} />
              )}
              <span className="text-xs font-mono text-slate-200 w-20 text-right">
                ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-slate-500 w-10 text-right">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
