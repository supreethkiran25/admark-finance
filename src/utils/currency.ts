/**
 * Exact financial currency formatter.
 * Standardizes USD presentation with tabular numbers.
 */

export function formatCurrency(
  amount: number,
  options: {
    showDecimals?: boolean;
    showSign?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showDecimals = true, showSign = false, compact = false } = options;

  if (compact && Math.abs(amount) >= 1000) {
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    return `$${(amount / 1_000).toFixed(1)}k`;
  }

  const sign = showSign && amount > 0 ? '+' : '';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  if (isNegative) {
    return `-${formatted}`;
  }
  return `${sign}${formatted}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}
