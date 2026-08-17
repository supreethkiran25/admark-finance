/**
 * Indian Rupee (INR - ₹) Currency Formatter.
 * Adheres to Indian Numbering System (Thousands, Lakhs, Crores).
 */

export function formatINR(
  amount: number,
  options: {
    showDecimals?: boolean;
    showSign?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showDecimals = true, showSign = false, compact = false } = options;

  if (compact && Math.abs(amount) >= 1000) {
    const abs = Math.abs(amount);
    const signPrefix = amount < 0 ? '-' : showSign ? '+' : '';
    if (abs >= 10000000) {
      // Crores (₹ Cr)
      return `${signPrefix}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      // Lakhs (₹ L)
      return `${signPrefix}₹${(abs / 100000).toFixed(2)} L`;
    }
    return `${signPrefix}₹${(abs / 1000).toFixed(1)} k`;
  }

  const sign = showSign && amount > 0 ? '+' : '';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  if (isNegative) {
    return `-${formatted}`;
  }
  return `${sign}${formatted}`;
}

export function formatCurrency(
  amount: number,
  options: {
    showDecimals?: boolean;
    showSign?: boolean;
    compact?: boolean;
  } = {}
): string {
  return formatINR(amount, options);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatIndianNumber(val: number): string {
  return new Intl.NumberFormat('en-IN').format(val);
}
