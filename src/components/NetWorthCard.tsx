interface Props {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  investmentCurrentValue?: number;
}

export function NetWorthCards({ totalIncome, totalExpenses, totalInvestments, investmentCurrentValue }: Props) {
  const netWorth = totalIncome + totalExpenses; // expenses are negative
  const liveInvestment = investmentCurrentValue ?? Math.abs(totalInvestments);

  const cards = [
    {
      title: 'Net Worth',
      value: netWorth,
      color: 'text-cyan-400',
      bg: 'from-cyan-900/20 to-transparent',
      border: 'border-cyan-800/40',
      icon: '💰',
    },
    {
      title: 'Total Income',
      value: totalIncome,
      color: 'text-emerald-400',
      bg: 'from-emerald-900/20 to-transparent',
      border: 'border-emerald-800/40',
      icon: '📈',
    },
    {
      title: 'Total Expenses',
      value: Math.abs(totalExpenses),
      color: 'text-rose-400',
      bg: 'from-rose-900/20 to-transparent',
      border: 'border-rose-800/40',
      icon: '📉',
    },
    {
      title: 'Invested',
      value: liveInvestment,
      color: 'text-violet-400',
      bg: 'from-violet-900/20 to-transparent',
      border: 'border-violet-800/40',
      icon: '🏦',
      subtitle: investmentCurrentValue ? 'Live value' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            ₹{Math.abs(c.value).toLocaleString('en-IN')}
          </p>
          {c.title === 'Net Worth' && (
            <p className={`text-xs mt-1 ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netWorth >= 0 ? '▲ Positive balance' : '▼ Negative balance'}
            </p>
          )}
          {'subtitle' in c && c.subtitle && (
            <p className="text-xs mt-1 text-violet-400/70">{c.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
