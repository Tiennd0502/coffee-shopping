import express, { Router } from 'express';

import { handleClerkWebhook } from '@/modules/webhooks/clerk/clerk.controller';
import { catchAsync } from '@/shared/utils/async-handler';

const router: Router = express.Router();

// Raw body required for svix signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), catchAsync(handleClerkWebhook));

export default router;
