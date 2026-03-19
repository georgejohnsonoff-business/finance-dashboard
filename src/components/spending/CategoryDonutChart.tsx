'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryBreakdownItem } from '@/lib/spending-analytics';
import { getCategoryIcon } from '@/lib/categories';

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-200 text-sm font-medium">{d.category}</p>
      <p className="text-slate-400 text-xs">
        ₹{d.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · {d.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

export function CategoryDonutChart({
  data,
  total,
  onCategorySelect,
  selectedCategory,
}: {
  data: CategoryBreakdownItem[];
  total: number;
  onCategorySelect?: (category: string | null) => void;
  selectedCategory?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <h3 className="text-slate-100 font-semibold mb-4">Where your money goes</h3>

      {data.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-10">No expenses this month</p>
      ) : (
        <>
          <div className="relative" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  onClick={(entry) => {
                    if (onCategorySelect) {
                      onCategorySelect(
                        selectedCategory === entry.category ? null : entry.category
                      );
                    }
                  }}
                  cursor="pointer"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color}
                      opacity={selectedCategory && selectedCategory !== entry.category ? 0.3 : 1}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-xl font-bold font-mono text-slate-100">
                ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            {data.slice(0, 8).map((item) => (
              <button
                key={item.category}
                onClick={() => onCategorySelect?.(selectedCategory === item.category ? null : item.category)}
                className={`flex items-center gap-2 text-left px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-800/50 ${
                  selectedCategory && selectedCategory !== item.category ? 'opacity-40' : ''
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-400 truncate flex-1">
                  {getCategoryIcon(item.category)} {item.category}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {item.percentage.toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
