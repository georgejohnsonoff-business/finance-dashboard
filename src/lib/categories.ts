export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Rent': '#06b6d4',
  'Transport': '#eab308',
  'Shopping': '#ec4899',
  'Entertainment': '#8b5cf6',
  'Health': '#10b981',
  'Utilities': '#64748b',
  'Salary': '#22c55e',
  'Freelance': '#14b8a6',
  'Mutual Funds': '#a78bfa',
  'Stocks': '#f59e0b',
  'SIP': '#7c3aed',
  'Other': '#6b7280',
  'Uncategorized': '#6b7280',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍔',
  'Rent': '🏠',
  'Transport': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Health': '💊',
  'Utilities': '⚡',
  'Salary': '💵',
  'Freelance': '💻',
  'Mutual Funds': '📊',
  'Stocks': '📈',
  'SIP': '🔄',
  'Other': '📦',
  'Uncategorized': '📦',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'];
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? CATEGORY_ICONS['Other'];
}
