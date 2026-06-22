import type { Repository } from 'typeorm';
import { z } from 'zod';

import { BadRequestError, ConflictError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { assertNoDuplicate, assignDefined, parseOrThrow } from '@/shared/utils/validation';

describe('parseOrThrow', () => {
  it('returns parsed data on success', () => {
    const schema = z.object({ name: z.string() });
    const result = parseOrThrow(schema.safeParse({ name: 'ok' }));
    expect(result).toEqual({ name: 'ok' });
  });

  it('throws BadRequestError with issue details when Zod fails', () => {
    const schema = z.object({ email: z.string().email() });
    try {
      parseOrThrow(schema.safeParse({ email: 'not-an-email' }));
      throw new Error('expected throw');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(BadRequestError);
      expect(e).toMatchObject({
        message: ERROR_MESSAGES.INVALID_REQUEST,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            errCode: 'INVALID_FORMAT',
          }),
        ]),
      });
    }
  });

  it('uses field "request" when Zod issue path is empty', () => {
    const schema = z.string();
    try {
      parseOrThrow(schema.safeParse(123));
      throw new Error('expected throw');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(BadRequestError);
      expect(e).toMatchObject({
        message: ERROR_MESSAGES.INVALID_REQUEST,
        errors: expect.arrayContaining([expect.objectContaining({ field: 'request' })]),
      });
    }
  });

  it('throws BadRequestError without details when error is not ZodError', () => {
    const result = { success: false as const, error: new Error('other') };
    try {
      parseOrThrow(result);
      throw new Error('expected throw');
    } catch (e: unknown) {
      expect(e).toMatchObject({ message: ERROR_MESSAGES.INVALID_REQUEST });
    }
  });
});

describe('assertNoDuplicate', () => {
  it('resolves when no row matches', async () => {
    const repo = { findOne: jest.fn().mockResolvedValue(null) };
    await expect(
      assertNoDuplicate(repo as unknown as Repository<{ id: string }>, { id: '1' }, 'exists'),
    ).resolves.toBeUndefined();
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('throws ConflictError when a row exists', async () => {
    const repo = { findOne: jest.fn().mockResolvedValue({ id: '1' }) };
    await expect(
      assertNoDuplicate(repo as unknown as Repository<{ id: string }>, { id: '1' }, 'taken'),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('assignDefined', () => {
  it('assigns only keys with non-undefined values', () => {
    const target = { a: 1, b: 2, c: 3 };
    assignDefined(target, { b: undefined, c: 30, d: 4 } as Partial<typeof target>);
    expect(target).toEqual({ a: 1, b: 2, c: 30, d: 4 });
  });
});
