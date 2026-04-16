import type { NextFunction, Request, Response } from 'express';

import { logger } from '@/config/logger';

/**
 * Logs one line per finished request at the `http` level (method, URL, status, duration).
 */
export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} ${String(res.statusCode)} ${String(durationMs)}ms`,
    );
  });

  next();
};
