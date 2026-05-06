import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import {
  badRequest,
  bearerAuth,
  dataResponse,
  paginatedResponse,
  registry,
  unauthorized,
  notFound,
  conflict,
} from '@/config/swagger';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import {
  CategoryResponseSchema,
  CategorySchema,
  ListCategoriesQuerySchema,
  categoryIdParamSchema,
} from './category.dto';
import { FIELD_KEYS } from './category.field';

const CATEGORY_TAG = 'Categories';

registry.registerPath({
  method: 'get',
  path: '/categories',
  tags: [CATEGORY_TAG],
  summary: 'List categories',
  security: [bearerAuth],
  request: { query: ListCategoriesQuerySchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: paginatedResponse(CategoryResponseSchema) } },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
  },
});

registry.registerPath({
  method: 'get',
  path: '/categories/{id}',
  tags: [CATEGORY_TAG],
  summary: 'Get category by UUID',
  security: [bearerAuth],
  request: { params: categoryIdParamSchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: dataResponse(CategoryResponseSchema) } },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: FIELD_KEYS.ID,
        message: ERROR_MESSAGES.NOT_FOUND('Category'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/categories',
  tags: [CATEGORY_TAG],
  summary: 'Create category (admin)',
  security: [bearerAuth],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CategorySchema } },
    },
  },
  responses: {
    [StatusCodes.CREATED]: {
      description: ReasonPhrases.CREATED,
      content: { 'application/json': { schema: dataResponse(CategoryResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: FIELD_KEYS.NAME,
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.CONFLICT]: conflict([
      {
        errCode: ErrorCode.CONFLICT,
        field: FIELD_KEYS.NAME,
        message: ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
      },
    ]),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/categories/{id}',
  tags: [CATEGORY_TAG],
  summary: 'Update category (admin)',
  security: [bearerAuth],
  request: {
    params: categoryIdParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: CategorySchema } },
    },
  },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: dataResponse(CategoryResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: FIELD_KEYS.NAME,
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: FIELD_KEYS.ID,
        message: ERROR_MESSAGES.NOT_FOUND('Category'),
      },
    ]),
    [StatusCodes.CONFLICT]: conflict([
      {
        errCode: ErrorCode.CONFLICT,
        field: FIELD_KEYS.NAME,
        message: ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
      },
    ]),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/categories/{id}',
  tags: [CATEGORY_TAG],
  summary: 'Delete category (admin)',
  security: [bearerAuth],
  request: { params: categoryIdParamSchema },
  responses: {
    [StatusCodes.NO_CONTENT]: { description: ReasonPhrases.NO_CONTENT },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: FIELD_KEYS.ID,
        message: ERROR_MESSAGES.NOT_FOUND('Category'),
      },
    ]),
  },
});
