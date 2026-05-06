import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';

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
import { PRODUCT_SORT, PRODUCT_STATUS } from '@/shared/enums/product';
import {
  CreateProductSchema,
  ProductResponseSchema,
  UpdateProductSchema,
  productIdParamSchema,
} from './product.dto';

const PRODUCT_TAG = 'Products';

registry.register('CreateProductInput', CreateProductSchema);
registry.register('UpdateProductInput', UpdateProductSchema);
registry.register('ProductResponse', ProductResponseSchema);

const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(PRODUCT_STATUS).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  roastLevel: z
    .string()
    .optional()
    .openapi({ description: 'Comma-separated roast levels', example: 'LIGHT,MEDIUM' }),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.nativeEnum(PRODUCT_SORT).optional(),
});

registry.registerPath({
  method: 'get',
  path: '/products',
  tags: [PRODUCT_TAG],
  summary: 'List products',
  request: { query: ProductListQuerySchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: paginatedResponse(ProductResponseSchema) } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/products/{id}',
  tags: [PRODUCT_TAG],
  summary: 'Get product by UUID',
  request: { params: productIdParamSchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: dataResponse(ProductResponseSchema) } },
    },
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Product'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'post',
  path: '/products',
  tags: [PRODUCT_TAG],
  summary: 'Create product (admin)',
  security: [bearerAuth],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateProductSchema } },
    },
  },
  responses: {
    [StatusCodes.CREATED]: {
      description: ReasonPhrases.CREATED,
      content: { 'application/json': { schema: dataResponse(ProductResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: 'name',
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.CONFLICT]: conflict([
      {
        errCode: ErrorCode.CONFLICT,
        field: 'slug',
        message: ERROR_MESSAGES.PRODUCT.SLUG_EXISTS,
      },
    ]),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/products/{id}',
  tags: [PRODUCT_TAG],
  summary: 'Update product (admin)',
  security: [bearerAuth],
  request: {
    params: productIdParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateProductSchema } },
    },
  },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: dataResponse(ProductResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: 'name',
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Product'),
      },
    ]),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/products/{id}',
  tags: [PRODUCT_TAG],
  summary: 'Delete product (admin)',
  security: [bearerAuth],
  request: { params: productIdParamSchema },
  responses: {
    [StatusCodes.NO_CONTENT]: { description: ReasonPhrases.NO_CONTENT },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.NOT_FOUND('Product'),
      },
    ]),
  },
});
