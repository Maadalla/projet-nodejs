import express from 'express';
import {
    createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject,
    inviteUserToProject,
    leaveProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(protect);

// Routes CRUD de base
router.post('/', createProject);           // POST /api/projects
router.get('/', getUserProjects);          // GET /api/projects
router.get('/:id', getProjectById);        // GET /api/projects/:id
router.patch('/:id', updateProject);       // PATCH /api/projects/:id
router.delete('/:id', deleteProject);      // DELETE /api/projects/:id

// Routes spéciales
router.post('/:id/invite', inviteUserToProject);  // POST /api/projects/:id/invite
router.post('/:id/leave', leaveProject);          // POST /api/projects/:id/leave

export default router;
