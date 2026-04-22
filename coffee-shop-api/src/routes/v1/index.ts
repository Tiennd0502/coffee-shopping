import { Router } from 'express';

import categoryRouter from './category.route';
import productRouter from './product.route';
import webhookRouter from './webhook.route';
import userRouter from './user.route';

const AppRouter: Router = Router();

AppRouter.use('/webhooks', webhookRouter);
AppRouter.use('/categories', categoryRouter);
AppRouter.use('/products', productRouter);
AppRouter.use('/', userRouter);

export default AppRouter;
