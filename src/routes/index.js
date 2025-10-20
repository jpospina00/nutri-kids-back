import { Router } from 'express';
import authRoutes from './auth.routes.js';
import foodRoutes from './food.routes.js';
import userRoutes from './user.route.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/food', foodRoutes);
router.use('/user', userRoutes);

export default router;
