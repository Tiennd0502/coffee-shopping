import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from '@/config/env';

// Middlewares
import { errorHandlerMiddleware } from '@/middlewares/error';
import { httpLoggerMiddleware } from '@/middlewares/http-logger';

// Routes
import router from '@/routes';

// Shared
import type { RawBodyRequest } from '@/shared/types/request';
import { TooManyRequestsError } from '@/shared/errors/app';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError());
    },
  }),
);

// Verify saves the raw buffer to req.rawBody before JSON parsing — required for svix webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as RawBodyRequest).rawBody = buf;
    },
  }),
);

app.use(httpLoggerMiddleware);

app.use('/api', router);

app.use(errorHandlerMiddleware);

export { app };
