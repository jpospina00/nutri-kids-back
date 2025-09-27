import { Router } from 'express';
import {
  forgotPassword,
  resetPassword,
  verifyPin,
  login,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-pin', verifyPin);
router.post('/reset-password', resetPassword);
router.post('/login', login);

export default router;
