import { getAuth } from '@clerk/express';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { findUserByClerkId } from '@/modules/user/user.service';
import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';
import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

/**
 * Requires a Clerk session on the request (use after {@link clerkMiddleware} on the same router).
 * Sets {@link Express.Request.userId} to the authenticated internal user UUID.
 * Rejects INACTIVE accounts even if the Clerk JWT is still valid.
 */
export const requireAuthenticated: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  let clerkId: string | null = null;
  try {
    clerkId = getAuth(req).userId;
  } catch {
    next(
      new AppError(ERROR_MESSAGES.UNAUTHENTICATED, StatusCodes.UNAUTHORIZED, {
        code: ErrorCode.UNAUTHORIZED,
      }),
    );
    return;
  }

  if (!clerkId) {
    next(
      new AppError(ERROR_MESSAGES.UNAUTHENTICATED, StatusCodes.UNAUTHORIZED, {
        code: ErrorCode.UNAUTHORIZED,
      }),
    );
    return;
  }

  const user = await findUserByClerkId(clerkId);
  if (!user) {
    next(
      new AppError(ERROR_MESSAGES.UNAUTHENTICATED, StatusCodes.UNAUTHORIZED, {
        code: ErrorCode.UNAUTHORIZED,
      }),
    );
    return;
  }

  if (user.status === USER_STATUS.INACTIVE) {
    next(
      new AppError(ERROR_MESSAGES.INACTIVE_ACCOUNT, StatusCodes.FORBIDDEN, {
        code: ErrorCode.FORBIDDEN,
      }),
    );
    return;
  }

  req.userId = user.id;
  req.userRole = user.role;
  next();
};

export const requireAdmin: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.userRole !== USER_ROLE.ADMIN) {
    next(
      new AppError(ERROR_MESSAGES.FORBIDDEN, StatusCodes.FORBIDDEN, {
        code: ErrorCode.FORBIDDEN,
      }),
    );
    return;
  }
  next();
};
