import { clerkMiddleware } from '@clerk/express';
import type { ErrorRequestHandler } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { userController } from '@/container';
import { requireAdmin, requireAuthenticated } from '@/middlewares/auth';
import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

const router: Router = Router();

const clerkErrorHandler: ErrorRequestHandler = (_err, _req, _res, next) => {
  next(
    new AppError(ERROR_MESSAGES.UNAUTHENTICATED, StatusCodes.UNAUTHORIZED, {
      code: ErrorCode.UNAUTHORIZED,
    }),
  );
};

router.use(clerkMiddleware());
router.use(clerkErrorHandler);
router.use(requireAuthenticated);

router.get('/me', userController.getMe);

router.use('/users', requireAdmin);
router.get('/users', userController.list);
router.get('/users/:id', userController.get);
router.post('/users', userController.create);
router.patch('/users/:id', userController.update);
router.delete('/users/:id', userController.remove);

export default router;
