import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';

// Middlewares
import { errorHandlerMiddleware } from '@/middlewares/error';
import { httpLoggerMiddleware } from '@/middlewares/http-logger';

// Routes
import router from '@/routes';

// Shared
import { catchAsync } from '@/shared/utils/async-handler';
import type { RawBodyRequest } from '@/shared/types/request';

const app = express();

app.use(helmet());
app.use(cors());

// Verify saves the raw buffer to req.rawBody before JSON parsing — required for svix webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as RawBodyRequest).rawBody = buf;
    },
  }),
);
app.use(httpLoggerMiddleware);

app.get(
  '/',
  catchAsync((_req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Coffee Shop API', status: 'ok' });
  }),
);

app.use('/api', router);

app.use(errorHandlerMiddleware);

export { app };
