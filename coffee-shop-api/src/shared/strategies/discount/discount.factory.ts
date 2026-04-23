import { DISCOUNT_TYPE } from '@/shared/enums/product';

import type { DiscountStrategy } from './discount';
import { PercentDiscountStrategy } from './percent-discount';
import { FixedDiscountStrategy } from './fixed-discount';

export class DiscountStrategyFactory {
  static create(discountType: DISCOUNT_TYPE): DiscountStrategy {
    if (discountType === DISCOUNT_TYPE.PERCENT) return new PercentDiscountStrategy();
    return new FixedDiscountStrategy();
  }
}
