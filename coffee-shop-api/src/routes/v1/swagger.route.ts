import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { buildOpenApiDocument } from '@/config/swagger';
import { isProduction } from '@/config/env';

import '@/modules/user/user.swagger';

const router: Router = Router();

if (!isProduction) {
  const spec = buildOpenApiDocument();
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(spec));
}

export default router;
