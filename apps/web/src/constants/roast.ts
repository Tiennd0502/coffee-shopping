import { ROAST_LEVEL, PRODUCT_SORT, type OptionItem } from '@repo/types';

export const ROAST_PRICE_MIN = 5;
export const ROAST_PRICE_MAX = 250;
export const ROAST_DEFAULT_PRICE_RANGE: [number, number] = [ROAST_PRICE_MIN, ROAST_PRICE_MAX];

export const ROAST_LEVEL_OPTIONS: OptionItem<ROAST_LEVEL>[] = [
  { value: ROAST_LEVEL.LIGHT, label: 'Light Roast' },
  { value: ROAST_LEVEL.MEDIUM, label: 'Medium Roast' },
  { value: ROAST_LEVEL.DARK, label: 'Dark Roast' },
];

export const ROAST_LEVEL_SPECTRUM_PERCENT: Record<ROAST_LEVEL, number> = {
  [ROAST_LEVEL.LIGHT]: 15,
  [ROAST_LEVEL.MEDIUM]: 50,
  [ROAST_LEVEL.DARK]: 85,
};

export const ROAST_SORT_OPTIONS: OptionItem<PRODUCT_SORT>[] = [
  { value: PRODUCT_SORT.PRICE_ASC, label: 'Price: Low to High' },
  { value: PRODUCT_SORT.PRICE_DESC, label: 'Price: High to Low' },
  { value: PRODUCT_SORT.NAME_ASC, label: 'Name: A to Z' },
  { value: PRODUCT_SORT.NAME_DESC, label: 'Name: Z to A' },
];

export interface RoastCollection {
  id: string;
  name: string;
  price: number;
  flavorNotes: string;
  roastMeta: string;
  roastLevel: ROAST_LEVEL;
  imageUrl: string;
  badgeLabel?: string;
}
