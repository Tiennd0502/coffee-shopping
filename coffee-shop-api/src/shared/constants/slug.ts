/**
 * Defaults for URL slug generation (diacritics stripped in code, then slugify).
 */
export const SLUG = {
  RANDOM_SUFFIX_BYTES: 8,
  SLUGIFY: {
    lower: true,
    strict: true,
    trim: true,
  },
} as const;
