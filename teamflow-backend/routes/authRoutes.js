import express from 'express';
import {
    register,
    login,
    getMe,
    logout
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes publiques (pas d'authentification requise)
router.post('/register', register);  // POST /api/auth/register
router.post('/login', login);        // POST /api/auth/login

// Routes protégées (authentification requise)
router.get('/me', protect, getMe);   // GET /api/auth/me
router.post('/logout', protect, logout); // POST /api/auth/logout

export default router;
