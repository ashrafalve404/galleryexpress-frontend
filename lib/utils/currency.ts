export function formatCurrency(amount: number | string, currency = 'BDT'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '৳0';
  return `৳${n.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[৳,]/g, '')) || 0;
}

export function calculateDiscount(price: number, discountPercent: number): number {
  return price - (price * discountPercent) / 100;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
