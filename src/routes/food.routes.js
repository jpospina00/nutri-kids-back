import { Router } from 'express';
import {
  generateFoods,
  generateRecommendations,
  getDailyFoodPlan,
  getFoodHistory,
} from '../controllers/food.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/generate/:idUser', verifyToken, generateFoods);
router.get('/plan/:idUser', verifyToken, getDailyFoodPlan);
router.get('/recommendations/:idUser', verifyToken, generateRecommendations);
router.get('/history/:idUser', verifyToken, getFoodHistory);

export default router;
