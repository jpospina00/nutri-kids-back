import { Router } from 'express';
import { generateFoods } from '../controllers/food.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/generate/:idUser', verifyToken, generateFoods);

export default router;
