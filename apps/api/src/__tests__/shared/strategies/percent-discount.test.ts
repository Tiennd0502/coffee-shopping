import { PercentDiscountStrategy } from '@/shared/strategies/discount/percent-discount';

describe('PercentDiscountStrategy', () => {
  const strategy = new PercentDiscountStrategy();

  it('calculates discounted amount as percent of price and rounds to 2 decimals', () => {
    expect(strategy.calculate(100, 10)).toBe(10);
    expect(strategy.calculate(200, 25)).toBe(50);
    expect(strategy.calculate(99.99, 50)).toBe(49.99);
  });

  it('clamps percent via normalizeDiscountPercent (null and out of range)', () => {
    expect(strategy.calculate(100, null)).toBe(0);
    expect(strategy.calculate(100, 150)).toBe(100);
    expect(strategy.calculate(100, -10)).toBe(0);
  });
});
