import express from 'express';
import { getComments, createComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for /api/comments
// But waits, we want /tasks/:id/comments.
// If we mount at /api, then we need full path.
// Or we can just handle it here.

router.get('/tasks/:id/comments', protect, getComments);
router.post('/tasks/:id/comments', protect, createComment);

export default router;
