import { StatusCodes } from 'http-status-codes';
import type { WebhookRequiredHeaders } from 'svix';
import { Webhook } from 'svix';

import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import type { RawBodyRequest } from '@/shared/types/request';

import { env } from './env';

export function verifyClerkWebhook(req: RawBodyRequest): ReturnType<Webhook['verify']> {
  const clerkWebhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  const svixHeaders: WebhookRequiredHeaders = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  };

  if (!req.rawBody) {
    throw new AppError(ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE, StatusCodes.BAD_REQUEST, {
      code: ErrorCode.BAD_REQUEST,
    });
  }

  return clerkWebhook.verify(req.rawBody, svixHeaders);
}
