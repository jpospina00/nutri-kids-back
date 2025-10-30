import { Router } from 'express';
import {
  createUser,
  getUserById,
  updateGoalCalories,
  updateIngredientPreference,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.get('/users-by-user', verifyToken, getUserById);
router.patch(
  '/:idUser/ingredient-preference',
  verifyToken,
  updateIngredientPreference
);
router.post('/', verifyToken, createUser);
router.put('/goalCalories/:idUser', verifyToken, updateGoalCalories);

export default router;
