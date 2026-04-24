import { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } from '@/shared/enums/order';
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

const PAYMENT_TRANSITIONS: Readonly<Record<PAYMENT_STATUS, readonly PAYMENT_STATUS[]>> = {
  [PAYMENT_STATUS.UNPAID]: [PAYMENT_STATUS.PENDING],
  [PAYMENT_STATUS.PENDING]: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED],
  [PAYMENT_STATUS.PAID]: [],
  [PAYMENT_STATUS.FAILED]: [PAYMENT_STATUS.PENDING],
};

export const assertValidOrderStatusTransition = (from: ORDER_STATUS, to: ORDER_STATUS): void => {
  if (!ORDER_TRANSITIONS[from].includes(to)) {
    throw new BadRequestError(ERROR_MESSAGES.ORDER.INVALID_TRANSITION('order', from, to));
  }
};

export const assertOrderTransition = (current: ORDER_STATUS, next: ORDER_STATUS): void => {
  assertValidOrderStatusTransition(current, next);
};

export const assertShippingTransition = (current: SHIPPING_STATUS, next: SHIPPING_STATUS): void => {
  if (!SHIPPING_TRANSITIONS[current].includes(next)) {
    throw new BadRequestError(
      ERROR_MESSAGES.ORDER.INVALID_TRANSITION('shipping status', current, next),
    );
  }
};

export const assertPaymentTransition = (current: PAYMENT_STATUS, next: PAYMENT_STATUS): void => {
  if (!PAYMENT_TRANSITIONS[current].includes(next)) {
    throw new BadRequestError(
      ERROR_MESSAGES.ORDER.INVALID_TRANSITION('payment status', current, next),
    );
  }
};
