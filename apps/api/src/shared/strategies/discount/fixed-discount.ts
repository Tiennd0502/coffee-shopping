import { formatMoney, normalizeDiscountAmount, type DiscountStrategy } from './discount';

export class FixedDiscountStrategy implements DiscountStrategy {
  calculate(price: number, discountValue: number | null): number {
    const normalizedAmount = normalizeDiscountAmount(price, discountValue);
    return formatMoney(normalizedAmount);
  }
}
