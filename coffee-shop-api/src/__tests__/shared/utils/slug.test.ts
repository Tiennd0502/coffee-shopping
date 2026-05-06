import { slugFrom } from '@/shared/utils/slug';

describe('slugFrom', () => {
  it('trims and slugifies ASCII text', () => {
    expect(slugFrom('  Hello World  ')).toBe('hello-world');
  });

  it('strips diacritics before slugifying', () => {
    expect(slugFrom('Café')).toBe('cafe');
    expect(slugFrom('Ñandú')).toBe('nandu');
  });

  it('returns empty string when input trims to empty', () => {
    expect(slugFrom('   ')).toBe('');
  });
});
