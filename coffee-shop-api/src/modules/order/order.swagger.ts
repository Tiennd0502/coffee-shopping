import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { badRequest, bearerAuth, registry, unauthorized, notFound } from '@/config/swagger';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { ORDER_STATUS, SHIPPING_STATUS } from '@/shared/enums/order';
import {
  CreateOrderSchema,
  ListOrdersQuerySchema,
  OrderResponseSchema,
  UpdateOrderStatusSchema,
  UpdateShippingStatusSchema,
  orderIdParamSchema,
} from './order.dto';

const ORDER_TAG = 'Orders';

registry.register('CreateOrderInput', CreateOrderSchema);
registry.register('UpdateOrderStatusInput', UpdateOrderStatusSchema);
registry.register('UpdateShippingStatusInput', UpdateShippingStatusSchema);
registry.register('OrderResponse', OrderResponseSchema);

registry.registerPath({
  method: 'get',
  path: '/orders',
  tags: [ORDER_TAG],
  summary: 'List orders',
  security: [bearerAuth],
  request: { query: ListOrdersQuerySchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: OrderResponseSchema.array() } },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
  },
});

registry.registerPath({
  method: 'get',
  path: '/orders/{id}',
  tags: [ORDER_TAG],
  summary: 'Get order by UUID',
  security: [bearerAuth],
  request: { params: orderIdParamSchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: OrderResponseSchema } },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Order'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/orders',
  tags: [ORDER_TAG],
  summary: 'Place order',
  security: [bearerAuth],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateOrderSchema } },
    },
  },
  responses: {
    [StatusCodes.CREATED]: {
      description: ReasonPhrases.CREATED,
      content: { 'application/json': { schema: OrderResponseSchema } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: 'items',
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Order'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/orders/{id}/status',
  tags: [ORDER_TAG],
  summary: 'Update order status (admin)',
  security: [bearerAuth],
  request: {
    params: orderIdParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateOrderStatusSchema } },
    },
  },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: OrderResponseSchema } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: 'status',
          message: ERROR_MESSAGES.ORDER.INVALID_TRANSITION(
            'order',
            ORDER_STATUS.PENDING,
            ORDER_STATUS.COMPLETED,
          ),
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Order'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/orders/{id}/shipping-status',
  tags: [ORDER_TAG],
  summary: 'Update shipping status (admin)',
  security: [bearerAuth],
  request: {
    params: orderIdParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateShippingStatusSchema } },
    },
  },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: OrderResponseSchema } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: 'status',
          message: ERROR_MESSAGES.ORDER.INVALID_TRANSITION(
            'shipping',
            SHIPPING_STATUS.PENDING,
            SHIPPING_STATUS.RETURNED,
          ),
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Order'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/orders/{id}',
  tags: [ORDER_TAG],
  summary: 'Delete order (admin)',
  security: [bearerAuth],
  request: { params: orderIdParamSchema },
  responses: {
    [StatusCodes.NO_CONTENT]: { description: ReasonPhrases.NO_CONTENT },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: 'id',
          message: ERROR_MESSAGES.ORDER.CANNOT_DELETE_ORDER,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Order'),
      },
    ]),
  },
});
