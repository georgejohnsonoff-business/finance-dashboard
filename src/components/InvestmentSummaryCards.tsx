interface Props {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
}

export function InvestmentSummaryCards({ totalInvested, totalCurrentValue, totalGainLoss }: Props) {
  const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  const isPositive = totalGainLoss >= 0;

  const cards = [
    {
      title: 'Total Invested',
      value: totalInvested,
      color: 'text-violet-400',
      bg: 'from-violet-900/20 to-transparent',
      border: 'border-violet-800/40',
      icon: '🏦',
    },
    {
      title: 'Current Value',
      value: totalCurrentValue,
      color: 'text-cyan-400',
      bg: 'from-cyan-900/20 to-transparent',
      border: 'border-cyan-800/40',
      icon: '📊',
    },
    {
      title: 'P&L',
      value: totalGainLoss,
      color: isPositive ? 'text-emerald-400' : 'text-rose-400',
      bg: isPositive ? 'from-emerald-900/20 to-transparent' : 'from-rose-900/20 to-transparent',
      border: isPositive ? 'border-emerald-800/40' : 'border-rose-800/40',
      icon: isPositive ? '📈' : '📉',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            ₹{Math.abs(c.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          {c.title === 'P&L' && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(gainLossPercent).toFixed(2)}%
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
