import {
  OpenApiGeneratorV31,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { FIELD_KEYS } from '@/shared/constants/swagger';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

/**
 * Single validation / client error line item.
 */
export const ErrorItemSchema = z
  .object({
    errCode: z.string().openapi({ example: ErrorCode.BAD_REQUEST }),
    field: z.string().openapi({ example: FIELD_KEYS.EMAIL }),
    message: z.string().openapi({ example: ERROR_MESSAGES.INVALID_REQUEST }),
    description: z.string().optional(),
  })
  .openapi('ErrorItem');

/**
 * Standard error envelope for documented error responses.
 */
export const ErrorResponseSchema = z
  .object({
    statusCode: z.number().int().openapi({ example: StatusCodes.BAD_REQUEST }),
    message: z.string().openapi({ example: ReasonPhrases.BAD_REQUEST }),
    errors: z.array(ErrorItemSchema),
  })
  .openapi('ErrorResponse');

registry.register('ErrorItem', ErrorItemSchema);
registry.register('ErrorResponse', ErrorResponseSchema);

export const PaginationMetaSchema = z
  .object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .openapi('PaginationMeta');

registry.register('PaginationMeta', PaginationMetaSchema);

export const dataResponse = <T extends z.ZodTypeAny>(schema: T) => z.object({ data: schema });

export const paginatedResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ data: z.array(schema), meta: PaginationMetaSchema });

export const bearerAuth = { bearerAuth: [] };

type ErrorItem = z.infer<typeof ErrorItemSchema>;

export const badRequest = ({ errors }: { errors: ErrorItem[] }) => ({
  description: ReasonPhrases.BAD_REQUEST,
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
      example: {
        statusCode: StatusCodes.BAD_REQUEST,
        message: ReasonPhrases.BAD_REQUEST,
        errors,
      },
    },
  },
});

export const unauthorized = () => ({
  description: ReasonPhrases.UNAUTHORIZED,
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
      example: {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: ReasonPhrases.UNAUTHORIZED,
      },
    },
  },
});

export const notFound = (errors: ErrorItem[]) => ({
  description: ReasonPhrases.NOT_FOUND,
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
      example: {
        statusCode: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND,
        errors,
      },
    },
  },
});

export const conflict = (errors: ErrorItem[]) => ({
  description: ReasonPhrases.CONFLICT,
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
      example: {
        statusCode: StatusCodes.CONFLICT,
        message: ReasonPhrases.CONFLICT,
        errors,
      },
    },
  },
});

export const buildOpenApiDocument = (): ReturnType<OpenApiGeneratorV31['generateDocument']> => {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title: 'Coffee Shop API', version: '1.0.0' },
    servers: [{ url: '/api/v1' }],
  });
};
