import { DISCOUNT_TYPE } from '@/shared/enums/product';
import { DiscountStrategyFactory } from '@/shared/strategies/discount/discount.factory';
import { FixedDiscountStrategy } from '@/shared/strategies/discount/fixed-discount';
import { PercentDiscountStrategy } from '@/shared/strategies/discount/percent-discount';

describe('DiscountStrategyFactory', () => {
  it('returns PercentDiscountStrategy for PERCENT', () => {
    const strategy = DiscountStrategyFactory.create(DISCOUNT_TYPE.PERCENT);
    expect(strategy).toBeInstanceOf(PercentDiscountStrategy);
  });

  it('returns FixedDiscountStrategy for FIXED', () => {
    const strategy = DiscountStrategyFactory.create(DISCOUNT_TYPE.FIXED);
    expect(strategy).toBeInstanceOf(FixedDiscountStrategy);
  });
});
