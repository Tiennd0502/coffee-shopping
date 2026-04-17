import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { verifyClerkWebhook } from '@/config/clerk';
import { logger } from '@/config/logger';
import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_INVALID_WEBHOOK_SIGNATURE } from '@/shared/errors/messages';
import type { RawBodyRequest } from '@/shared/types/request';

type ClerkWebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

export const handleClerkWebhook = (req: RawBodyRequest, res: Response) => {
  let event: ClerkWebhookEvent;

  try {
    event = verifyClerkWebhook(req) as ClerkWebhookEvent;
  } catch {
    throw new AppError(ERROR_INVALID_WEBHOOK_SIGNATURE, StatusCodes.BAD_REQUEST, {
      code: ErrorCode.BAD_REQUEST,
    });
  }

  const moduleLogger = logger.child({ service: 'clerk-webhook', eventType: event.type });

  switch (event.type) {
    case 'user.created':
      moduleLogger.info('User created', { userId: event.data.id });
      break;

    case 'user.updated':
      moduleLogger.info('User updated', { userId: event.data.id });
      break;

    case 'user.deleted':
      moduleLogger.info('User deleted', { userId: event.data.id });
      break;

    default:
      moduleLogger.info('Unhandled webhook event', { eventType: event.type });
  }

  res.status(StatusCodes.OK).json({ received: true });
};
