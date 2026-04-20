import { clerkMiddleware } from '@clerk/express';
import { Router } from 'express';

import * as userController from '@/modules/user/user.v1.controller';
import { requireAuthenticated } from '@/middlewares/auth';

const router: Router = Router();

router.use(clerkMiddleware());
router.use(requireAuthenticated);

router.get('/users', userController.listUsers);
router.get('/users/:id', userController.getUser);
router.post('/users', userController.createUser);
router.patch('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

export default router;
