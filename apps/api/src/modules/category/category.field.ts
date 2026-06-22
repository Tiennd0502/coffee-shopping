import type { Category } from '@/modules/category/category.entity';

export const FIELD_KEYS = {
  ID: 'id',
  NAME: 'name',
  SLUG: 'slug',
} as const satisfies Partial<Record<string, keyof Category>>;
