import { BadRequestError, ConflictError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

import type { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

type SafeParseResult<T> = { success: true; data: T } | { success: false; error: unknown };

/**
 * Use after `schema.safeParse(req.body | req.query | req.params)`:
 * returns parsed data or throws {@link BadRequestError} (400).
 */
export function parseOrThrow<T>(result: SafeParseResult<T>): T {
  if (!result.success) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_REQUEST);
  }
  return result.data;
}

/**
 * Fails with {@link ConflictError} if `repo` already has a row matching `where`.
 * With soft-delete entities, align `where` with your partial unique indexes (TypeORM skips deleted rows by default when using `DeleteDateColumn`).
 */
export async function assertNoDuplicate<Entity extends ObjectLiteral>(
  repo: Repository<Entity>,
  where: FindOptionsWhere<Entity>,
  conflictMessage: string,
): Promise<void> {
  const existing = await repo.findOne({ where });
  if (existing) {
    throw new ConflictError(conflictMessage);
  }
}
