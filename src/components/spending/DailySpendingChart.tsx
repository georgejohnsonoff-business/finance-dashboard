'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { DailySpendingResult } from '@/lib/spending-analytics';

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-300 text-xs">
        Day {d.day} ({dayNames[d.dayOfWeek]}) {d.isWeekend ? '· Weekend' : ''}
      </p>
      <p className="text-slate-100 text-sm font-mono font-semibold">
        ₹{d.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

export function DailySpendingChart({ data }: { data: DailySpendingResult }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 font-semibold">Daily Spending</h3>
        <span className="text-xs text-slate-500">
          Avg: ₹{data.averageDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data.days} barCategoryGap={1}>
          <XAxis
            dataKey="day"
            tick={{ fill: '#64748b', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v > 0 ? `₹${(v / 1000).toFixed(0)}k` : ''}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={data.averageDaily}
            stroke="#6366f1"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
            {data.days.map((d) => (
              <Cell
                key={d.day}
                fill={d.isWeekend ? '#8b5cf6' : '#6366f1'}
                opacity={d.amount === 0 ? 0.15 : 0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-2 justify-center">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-sm bg-indigo-500" /> Weekday
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-sm bg-violet-500" /> Weekend
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 border-t border-dashed border-indigo-500" /> Average
        </span>
      </div>
    </div>
  );
}
