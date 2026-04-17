import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';

import { errorHandlerMiddleware } from '@/middlewares/error';
import { httpLoggerMiddleware } from '@/middlewares/http-logger';
import { catchAsync } from '@/shared/utils/async-handler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(httpLoggerMiddleware);

app.get(
  '/',
  catchAsync((_req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Coffee Shop API', status: 'ok' });
  }),
);

app.use(errorHandlerMiddleware);

export { app };
