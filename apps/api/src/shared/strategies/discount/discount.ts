export interface DiscountStrategy {
  calculate(price: number, discountValue: number | null): number;
}

const toFiniteNumber = (value: number | null): number => {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return value;
};

export const normalizeDiscountPercent = (discountValue: number | null): number => {
  const parsed = toFiniteNumber(discountValue);
  return Math.min(100, Math.max(0, parsed));
};

export const normalizeDiscountAmount = (price: number, discountValue: number | null): number => {
  const parsed = toFiniteNumber(discountValue);
  return Math.min(price, Math.max(0, parsed));
};

export const formatMoney = (value: number): number => Number(value.toFixed(2));
