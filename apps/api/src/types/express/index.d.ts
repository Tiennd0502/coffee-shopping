import type { USER_ROLE } from '@repo/types';

declare global {
  namespace Express {
    interface Request {
      /**
       * Optional user id when Clerk is not used or for testing overrides.
       * Otherwise `AppError.attachRequestContext` reads Clerk via `getAuth(req)` when middleware is present.
       */
      userId?: string;
      userRole?: USER_ROLE;
    }
  }
}

export {};
