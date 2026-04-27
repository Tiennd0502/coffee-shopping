import { createClerkClient } from '@clerk/express';
import type { WebhookRequiredHeaders } from 'svix';
import { Webhook } from 'svix';

import { BadRequestError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import type { RawBodyRequest } from '@/shared/types/request';

import { env } from './env';

export const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export function verifyClerkWebhook(req: RawBodyRequest): ReturnType<Webhook['verify']> {
  const clerkWebhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  const svixHeaders: WebhookRequiredHeaders = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  };

  if (!req.rawBody) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
  }

  return clerkWebhook.verify(req.rawBody, svixHeaders);
}
