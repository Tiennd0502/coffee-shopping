import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { ErrorResponseSchema, registry } from '@/config/swagger';
import { FIELD_KEYS } from './user.field';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

import {
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseSchema,
  userRecordIdParamSchema,
} from './user.dto';

const USER_TAG = 'Users';
const bearerAuth = { bearerAuth: [] };

registry.register('CreateUserInput', CreateUserSchema);
registry.register('UpdateUserInput', UpdateUserSchema);
registry.register('UserResponse', UserResponseSchema);

const errorContent = (statusCode: number, message: string) => ({
  description: message,
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
      example: {
        statusCode,
        message,
        errors: [],
      },
    },
  },
});

const unauthorized = () => errorContent(StatusCodes.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHENTICATED);

registry.registerPath({
  method: 'get',
  path: '/me',
  tags: [USER_TAG],
  summary: 'Get user profile',
  security: [bearerAuth],
  responses: {
    [StatusCodes.OK]: {
      description: 'Authenticated user',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users',
  tags: [USER_TAG],
  summary: 'List all users',
  security: [bearerAuth],
  responses: {
    [StatusCodes.OK]: {
      description: 'Array of users',
      content: { 'application/json': { schema: UserResponseSchema.array() } },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Get user by UUID',
  security: [bearerAuth],
  request: { params: userRecordIdParamSchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    [StatusCodes.BAD_REQUEST]: {
      description: ReasonPhrases.BAD_REQUEST,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.BAD_REQUEST,
            message: ReasonPhrases.BAD_REQUEST,
            errors: [
              {
                errCode: ErrorCode.BAD_REQUEST,
                field: FIELD_KEYS.ID,
                message: ERROR_MESSAGES.FIELD_INVALID(FIELD_KEYS.ID),
              },
            ],
          },
        },
      },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: {
      description: ReasonPhrases.NOT_FOUND,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.NOT_FOUND,
            message: ReasonPhrases.NOT_FOUND,
            errors: [
              {
                errCode: ErrorCode.NOT_FOUND,
                field: FIELD_KEYS.ID,
                message: ERROR_MESSAGES.NOT_FOUND('User'),
              },
            ],
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/users',
  tags: [USER_TAG],
  summary: 'Create user',
  security: [bearerAuth],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateUserSchema } },
    },
  },
  responses: {
    [StatusCodes.CREATED]: {
      description: ReasonPhrases.CREATED,
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    [StatusCodes.BAD_REQUEST]: {
      description: ReasonPhrases.BAD_REQUEST,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.BAD_REQUEST,
            message: ReasonPhrases.BAD_REQUEST,
            errors: [
              {
                errCode: ErrorCode.BAD_REQUEST,
                field: FIELD_KEYS.EMAIL,
                message: ERROR_MESSAGES.INVALID_REQUEST,
              },
            ],
          },
        },
      },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.CONFLICT]: {
      description: ReasonPhrases.CONFLICT,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.CONFLICT,
            message: ReasonPhrases.CONFLICT,
            errors: [
              {
                errCode: ErrorCode.CONFLICT,
                field: FIELD_KEYS.EMAIL,
                message: ERROR_MESSAGES.EMAIL_EXISTS,
              },
            ],
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Update user',
  security: [bearerAuth],
  request: {
    params: userRecordIdParamSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: UpdateUserSchema } },
    },
  },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    [StatusCodes.BAD_REQUEST]: {
      description: ERROR_MESSAGES.INVALID_REQUEST,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.BAD_REQUEST,
            message: ReasonPhrases.BAD_REQUEST,
            errors: [
              {
                errCode: ErrorCode.BAD_REQUEST,
                field: FIELD_KEYS.EMAIL,
                message: ERROR_MESSAGES.INVALID_REQUEST,
              },
            ],
          },
        },
      },
    },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: {
      description: ReasonPhrases.NOT_FOUND,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.NOT_FOUND,
            message: ReasonPhrases.NOT_FOUND,
            errors: [
              {
                errCode: ErrorCode.NOT_FOUND,
                field: FIELD_KEYS.ID,
                message: ERROR_MESSAGES.NOT_FOUND('User'),
              },
            ],
          },
        },
      },
    },
    [StatusCodes.CONFLICT]: {
      description: ReasonPhrases.CONFLICT,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.CONFLICT,
            message: ReasonPhrases.CONFLICT,
            errors: [
              {
                errCode: ErrorCode.CONFLICT,
                field: FIELD_KEYS.EMAIL,
                message: ERROR_MESSAGES.EMAIL_EXISTS,
              },
            ],
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Soft-delete user',
  security: [bearerAuth],
  request: { params: userRecordIdParamSchema },
  responses: {
    [StatusCodes.NO_CONTENT]: { description: ReasonPhrases.NO_CONTENT },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: {
      description: ReasonPhrases.NOT_FOUND,
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
          example: {
            statusCode: StatusCodes.NOT_FOUND,
            message: ReasonPhrases.NOT_FOUND,
            errors: [
              {
                errCode: ErrorCode.NOT_FOUND,
                field: FIELD_KEYS.ID,
                message: ERROR_MESSAGES.NOT_FOUND('User'),
              },
            ],
          },
        },
      },
    },
  },
});
