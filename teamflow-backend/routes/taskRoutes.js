import express from 'express';
import {
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskById,
    addComment,
    getMyTasks,
    getComments
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(protect);

// Routes CRUD
router.get('/my-tasks', getMyTasks);     // GET /api/tasks/my-tasks (Must be before /:id)
router.get('/', getTasks);               // GET /api/tasks?projectId=xxx
router.post('/', createTask);            // POST /api/tasks
router.get('/:id', getTaskById);         // GET /api/tasks/:id
router.patch('/:id', updateTask);        // PATCH /api/tasks/:id
router.delete('/:id', deleteTask);       // DELETE /api/tasks/:id

// Route spéciale pour le drag & drop (changement de statut)
router.patch('/:id/status', updateTaskStatus);  // PATCH /api/tasks/:id/status

// Nouvelle route pour ajouter un commentaire
router.get('/:id/comments', getComments); // GET /api/tasks/:id/comments
router.post('/:id/comments', addComment); // POST /api/tasks/:id/comments

export default router;
