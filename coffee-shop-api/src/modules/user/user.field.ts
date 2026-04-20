import type { User } from '@/modules/user/user.entity';

export const FIELD_KEYS = {
  ID: 'id',
  EMAIL: 'email',
} as const satisfies Partial<Record<string, keyof User>>;
