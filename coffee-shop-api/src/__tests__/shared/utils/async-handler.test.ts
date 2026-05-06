import type { NextFunction, Request, Response } from 'express';

import { catchAsync } from '@/shared/utils/async-handler';

describe('catchAsync', () => {
  it('forwards rejected promises to next', async () => {
    const err = new Error('async fail');
    const handler = jest.fn().mockRejectedValue(err);
    const next = jest.fn() as NextFunction;
    const wrapped = catchAsync(handler as never);

    wrapped({} as Request, {} as Response, next);

    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(handler).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(err);
  });

  it('does not call next when handler resolves', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const next = jest.fn() as NextFunction;
    const wrapped = catchAsync(handler as never);

    wrapped({} as Request, {} as Response, next);

    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(next).not.toHaveBeenCalled();
  });
});
