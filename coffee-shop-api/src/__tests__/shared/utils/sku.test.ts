import { randomBytes } from 'node:crypto';

import { withRandomSkuSuffix } from '@/shared/utils/sku';

jest.mock('node:crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('withRandomSkuSuffix', () => {
  it('appends hyphen and suffix from random alphabet', () => {
    (randomBytes as unknown as jest.Mock).mockReturnValue(Buffer.from([0, 1, 2, 3]));

    expect(withRandomSkuSuffix('SKU-BASE')).toBe('SKU-BASE-ABCD');
  });

  it('respects custom suffix length', () => {
    (randomBytes as unknown as jest.Mock).mockReturnValue(Buffer.from([35, 35, 35]));

    expect(withRandomSkuSuffix('X', 3)).toBe('X-999');
  });
});
