import { clerkMiddleware } from '@clerk/express';
import type { ErrorRequestHandler } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { requireAdmin, requireAuthenticated } from '@/middlewares/auth';
import * as orderController from '@/modules/order/order.v1.controller';
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

router.post('/', orderController.createOrder);

router.use(requireAdmin);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/shipping-status', orderController.updateOrderShippingStatus);
router.delete('/:id', orderController.deleteOrder);

export default router;
