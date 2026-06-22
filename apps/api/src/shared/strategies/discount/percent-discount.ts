import { formatMoney, normalizeDiscountPercent, type DiscountStrategy } from './discount';

export class PercentDiscountStrategy implements DiscountStrategy {
  calculate(price: number, discountValue: number | null): number {
    const normalizedPercent = normalizeDiscountPercent(discountValue);
    return formatMoney(price * (normalizedPercent / 100));
  }
}
