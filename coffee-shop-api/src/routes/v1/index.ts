import { Router } from 'express';

import webhookRouter from './webhook.route';
import userRouter from './user.route';

const AppRouter: Router = Router();

AppRouter.use('/webhooks', webhookRouter);
AppRouter.use('/', userRouter);

export default AppRouter;
