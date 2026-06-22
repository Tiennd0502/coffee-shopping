import express, { Router } from 'express';

import { clerkController } from '@/container';

const router: Router = express.Router();

// Raw body required for svix signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), clerkController.handleWebhook);

export default router;
