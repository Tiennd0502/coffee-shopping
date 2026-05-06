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
import { FIELD_KEYS } from './user.field';

import {
  CreateUserSchema,
  ListUsersQuerySchema,
  UpdateUserSchema,
  UserMeResponseSchema,
  UserResponseSchema,
  userRecordIdParamSchema,
} from './user.dto';

const USER_TAG = 'Users';

registry.register('CreateUserInput', CreateUserSchema);
registry.register('UpdateUserInput', UpdateUserSchema);
registry.register('UserResponse', UserResponseSchema);
registry.register('UserMeResponse', UserMeResponseSchema);

registry.registerPath({
  method: 'get',
  path: '/me',
  tags: [USER_TAG],
  summary: 'Get user profile',
  security: [bearerAuth],
  responses: {
    [StatusCodes.OK]: {
      description: 'Authenticated user',
      content: { 'application/json': { schema: dataResponse(UserMeResponseSchema) } },
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
  request: { query: ListUsersQuerySchema },
  responses: {
    [StatusCodes.OK]: {
      description: ReasonPhrases.OK,
      content: { 'application/json': { schema: paginatedResponse(UserResponseSchema) } },
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
      content: { 'application/json': { schema: dataResponse(UserResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: FIELD_KEYS.ID,
          message: ERROR_MESSAGES.FIELD_INVALID(FIELD_KEYS.ID),
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: FIELD_KEYS.ID,
        message: ERROR_MESSAGES.NOT_FOUND('User'),
      },
    ]),
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
      content: { 'application/json': { schema: dataResponse(UserResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: FIELD_KEYS.EMAIL,
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.CONFLICT]: conflict([
      {
        errCode: ErrorCode.CONFLICT,
        field: FIELD_KEYS.EMAIL,
        message: ERROR_MESSAGES.EMAIL_EXISTS,
      },
    ]),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Update user (admin)',
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
      content: { 'application/json': { schema: dataResponse(UserResponseSchema) } },
    },
    [StatusCodes.BAD_REQUEST]: badRequest({
      errors: [
        {
          errCode: ErrorCode.BAD_REQUEST,
          field: FIELD_KEYS.EMAIL,
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      ],
    }),
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: FIELD_KEYS.ID,
        message: ERROR_MESSAGES.NOT_FOUND('User'),
      },
    ]),
    [StatusCodes.CONFLICT]: conflict([
      {
        errCode: ErrorCode.CONFLICT,
        field: FIELD_KEYS.EMAIL,
        message: ERROR_MESSAGES.EMAIL_EXISTS,
      },
    ]),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: [USER_TAG],
  summary: 'Delete user (admin)',
  security: [bearerAuth],
  request: { params: userRecordIdParamSchema },
  responses: {
    [StatusCodes.NO_CONTENT]: { description: ReasonPhrases.NO_CONTENT },
    [StatusCodes.UNAUTHORIZED]: unauthorized(),
    [StatusCodes.NOT_FOUND]: notFound([
      {
        errCode: ErrorCode.NOT_FOUND,
        field: FIELD_KEYS.ID,
        message: ERROR_MESSAGES.NOT_FOUND('User'),
      },
    ]),
  },
});
