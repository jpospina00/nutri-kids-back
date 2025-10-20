import { Router } from 'express';
import { getUserById } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.get('/users-by-user', verifyToken, getUserById);

export default router;
