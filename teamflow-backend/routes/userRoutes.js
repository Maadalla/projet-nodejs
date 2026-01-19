import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAllUsers, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.use(protect); // Protect all user routes

router.get('/', getAllUsers);
router.put('/profile', updateUserProfile);

export default router;
