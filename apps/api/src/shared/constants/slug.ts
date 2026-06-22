/**
 * Defaults for URL slug generation (diacritics stripped in code, then slugify).
 */
export const SLUG = {
  SLUGIFY: {
    lower: true,
    strict: true,
    trim: true,
  },
} as const;
