import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { requestAsyncContext } from '@/shared/utils/request-async-context';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Assigns a stable request id (from client header or generated), exposes it on `req` and in async context for logging.
 */
export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.get(REQUEST_ID_HEADER);
  const requestId = incoming && incoming.trim() !== '' ? incoming.trim() : randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  requestAsyncContext.run({ requestId }, () => {
    next();
  });
};
