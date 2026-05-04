import { clerkMiddleware } from '@clerk/express';
import type { ErrorRequestHandler } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { orderController } from '@/container';
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

router.get('/', orderController.list);
router.get('/:id', orderController.get);
router.post('/', orderController.create);

router.use(requireAdmin);
router.patch('/:id/status', orderController.updateStatus);
router.patch('/:id/shipping-status', orderController.updateShippingStatus);
router.delete('/:id', orderController.remove);

export default router;
