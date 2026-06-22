import { randomBytes } from 'node:crypto';

const SKU_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_SUFFIX_LENGTH = 4;

const randomFromAlphabet = (length: number): string => {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => SKU_ALPHABET[byte % SKU_ALPHABET.length]).join('');
};

export const withRandomSkuSuffix = (
  baseSku: string,
  suffixLength: number = DEFAULT_SUFFIX_LENGTH,
): string => `${baseSku}-${randomFromAlphabet(suffixLength)}`;
