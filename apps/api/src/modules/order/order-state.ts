import { ORDER_STATUS, SHIPPING_STATUS } from '@repo/types';
import { BadRequestError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

const ORDER_TRANSITIONS: Readonly<Record<ORDER_STATUS, readonly ORDER_STATUS[]>> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

const SHIPPING_TRANSITIONS: Readonly<Record<SHIPPING_STATUS, readonly SHIPPING_STATUS[]>> = {
  [SHIPPING_STATUS.PENDING]: [SHIPPING_STATUS.SHIPPING],
  [SHIPPING_STATUS.SHIPPING]: [SHIPPING_STATUS.DELIVERED, SHIPPING_STATUS.RETURNED],
  [SHIPPING_STATUS.DELIVERED]: [],
  [SHIPPING_STATUS.RETURNED]: [],
};

export const assertValidOrderStatusTransition = (from: ORDER_STATUS, to: ORDER_STATUS): void => {
  if (!ORDER_TRANSITIONS[from].includes(to)) {
    throw new BadRequestError(ERROR_MESSAGES.ORDER.INVALID_TRANSITION('order', from, to));
  }
};

export const assertShippingTransition = (current: SHIPPING_STATUS, next: SHIPPING_STATUS): void => {
  if (!SHIPPING_TRANSITIONS[current].includes(next)) {
    throw new BadRequestError(
      ERROR_MESSAGES.ORDER.INVALID_TRANSITION('shipping status', current, next),
    );
  }
};
