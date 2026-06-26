import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { WebhookEvent } from '@clerk/express';

import { verifyClerkWebhook } from '@/config/clerk';
import { createModuleLogger } from '@/config/logger';
import type { UserService, ClerkUserFields } from '@/modules/user/user.service';
import { USER_ROLE } from '@repo/types';
import { BadRequestError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import type { RawBodyRequest } from '@/shared/types/request';

import { ClerkEventType } from './clerk.events';

const log = createModuleLogger('ClerkWebhook');

export class ClerkController {
  constructor(private readonly userService: UserService) {}

  handleWebhook = async (req: RawBodyRequest, res: Response): Promise<void> => {
    let event: WebhookEvent;

    try {
      event = verifyClerkWebhook(req) as WebhookEvent;
    } catch {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
    }

    switch (event.type) {
      case ClerkEventType.USER_CREATED:
      case ClerkEventType.USER_UPDATED: {
        const { data } = event;

        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id,
        );
        if (!primaryEmail) {
          log.warn('No primary email on Clerk event, skipping sync', {
            clerkId: data.id,
            eventType: event.type,
          });
          break;
        }

        const primaryPhone = data.phone_numbers?.find((p) => p.id === data.primary_phone_number_id);
        const fields: ClerkUserFields = {
          clerkId: data.id,
          email: primaryEmail.email_address,
          firstName: data.first_name ?? '',
          lastName: data.last_name ?? '',
          phone: primaryPhone?.phone_number ?? '',
          avatarUrl: data.image_url ?? '',
          role: (data.public_metadata?.role as USER_ROLE) ?? undefined,
        };

        if (event.type === ClerkEventType.USER_CREATED) {
          await this.userService.syncClerkUserCreated(fields);
        } else {
          await this.userService.syncClerkUserUpdated(fields);
        }

        log.info('User synced from Clerk', { clerkId: data.id, eventType: event.type });
        break;
      }

      case ClerkEventType.USER_DELETED: {
        const clerkId = event.data.id;
        if (!clerkId) {
          log.warn('Clerk user.deleted received without id, skipping');
          break;
        }

        await this.userService.syncClerkUserDeleted(clerkId);
        log.info('User deleted from Clerk', { clerkId });
        break;
      }

      default:
        log.info('Unhandled webhook event', { eventType: event.type });
    }

    res.status(StatusCodes.OK).json({ received: true });
  };
}
