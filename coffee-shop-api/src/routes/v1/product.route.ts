import { clerkMiddleware } from '@clerk/express';
import type { ErrorRequestHandler } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { productController } from '@/container';
import { attachUserIfAuthenticated, requireAdmin, requireAuthenticated } from '@/middlewares/auth';
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
router.use(attachUserIfAuthenticated);

router.get('/', productController.list);
router.get('/:id', productController.get);

router.use(requireAuthenticated);
router.use(requireAdmin);
router.post('/', productController.create);
router.patch('/:id', productController.update);
router.delete('/:id', productController.remove);

export default router;
