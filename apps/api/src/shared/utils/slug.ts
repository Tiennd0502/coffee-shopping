import slugify from 'slugify';

import { SLUG } from '@/shared/constants/slug';

/**
 * Trim -> strip diacritics -> slugify (`SLUG.SLUGIFY`).
 * @param text - the text string to convert to a slug
 * @returns the slug string
 */
export function slugFrom(text: string): string {
  const ascii = text.trim().normalize('NFD').replace(/\p{M}/gu, '');
  return slugify(ascii, { ...SLUG.SLUGIFY });
}
