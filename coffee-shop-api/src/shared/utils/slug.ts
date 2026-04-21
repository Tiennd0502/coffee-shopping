import { randomBytes } from 'node:crypto';

import slugify from 'slugify';

import { SLUG } from '@/shared/constants/slug';

/**
 * Trim → strip diacritics → slugify (`SLUG.SLUGIFY`). Append a random suffix.
 * @param text - the text string to convert to a slug
 * @returns the slug string
 */
export function slugFrom(text: string): string {
  const ascii = text.trim().normalize('NFD').replace(/\p{M}/gu, '');
  const base = slugify(ascii, { ...SLUG.SLUGIFY });
  return `${base}-${randomBytes(SLUG.RANDOM_SUFFIX_BYTES).toString('hex')}`;
}
