import { Router } from 'express';

import webhookRouter from './webhook.route';

const AppRouter: Router = Router();

AppRouter.use('/webhooks', webhookRouter);

export default AppRouter;
