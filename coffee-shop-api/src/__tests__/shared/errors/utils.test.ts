import { StatusCodes } from 'http-status-codes';

import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { extractErrorMessage, getErrorLog } from '@/shared/errors/utils';

describe('getErrorLog', () => {
  it('serializes AppError with operational fields', () => {
    const err = new AppError('bad', StatusCodes.BAD_REQUEST, { code: ErrorCode.BAD_REQUEST });
    err.userId = 'u1';
    err.method = 'GET';
    err.url = '/x';

    expect(getErrorLog(err)).toEqual(
      expect.objectContaining({
        message: 'bad',
        code: ErrorCode.BAD_REQUEST,
        statusCode: StatusCodes.BAD_REQUEST,
        isOperational: true,
        userId: 'u1',
        method: 'GET',
        url: '/x',
        name: 'AppError',
      }),
    );
  });

  it('serializes generic Error', () => {
    const err = new Error('oops');
    expect(getErrorLog(err)).toEqual(expect.objectContaining({ message: 'oops', name: 'Error' }));
  });

  it('stringifies plain objects', () => {
    expect(getErrorLog({ code: 1 })).toEqual({ message: '{"code":1}' });
  });
});

describe('extractErrorMessage', () => {
  it('returns message for Error', () => {
    expect(extractErrorMessage(new Error('x'))).toBe('x');
  });

  it('JSON-stringifies objects', () => {
    expect(extractErrorMessage({ a: 1 })).toBe('{"a":1}');
  });

  it('stringifies primitives', () => {
    expect(extractErrorMessage(42)).toBe('42');
  });
});
