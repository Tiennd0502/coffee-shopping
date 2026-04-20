import { Router } from 'express';

import swaggerRouter from './v1/swagger.route';
import v1Router from './v1';

const router: Router = Router();

router.use('/api-docs', swaggerRouter);
router.use('/v1', v1Router);

export default router;
