import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

/**
 * ProjectController - Gestion complète des projets (Updated for RBAC)
 */

// POST /api/projects - Créer un nouveau projet
export const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Project name is required' });
        }

        // Créer le projet (l'utilisateur connecté devient ADMIN)
        const project = new Project({
            name,
            description: description || '',
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'ADMIN' }]
        });

        await project.save();

        // Populer les informations
        await project.populate('owner', 'username email avatarUrl');
        await project.populate('members.user', 'username email avatarUrl');

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project
        });

    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ success: false, message: 'Error creating project', error: error.message });
    }
};

// GET /api/projects - Récupérer tous les projets de l'utilisateur connecté
export const getUserProjects = async (req, res) => {
    try {
        // Trouver tous les projets où l'utilisateur est membre (members.user match)
        const projects = await Project.find({
            'members.user': req.user._id
        })
            .populate('owner', 'username email avatarUrl')
            .populate('members.user', 'username email avatarUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });

    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({ success: false, message: 'Error fetching projects', error: error.message });
    }
};

// GET /api/projects/:id - Récupérer un projet spécifique
export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id)
            .populate('owner', 'username email avatarUrl')
            .populate('members.user', 'username email avatarUrl');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Vérifier que l'utilisateur est membre
        const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'You are not a member of this project' });
        }

        // Récupérer toutes les tâches
        const tasks = await Task.find({ project: id })
            .populate('assignees', 'username email avatarUrl')
            .sort({ status: 1, position: 1 });

        // Ajouter les tâches au projet
        const projectWithTasks = {
            ...project.toObject(),
            tasks
        };

        res.status(200).json({ success: true, data: projectWithTasks });

    } catch (error) {
        console.error('Get project by ID error:', error);
        res.status(500).json({ success: false, message: 'Error fetching project', error: error.message });
    }
};

// PATCH /api/projects/:id - Mettre à jour un projet
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Seul le owner ou un ADMIN peut modifier
        // Note: Project model has explicit owner field, but RBAC is in members too. Let's rely on owner field for strict ownership, OR check RBAC.
        // For simple Monday.com style, maybe ALL admins can edit?
        // Let's stick to Owner ONLY for settings updates for safety, or check if user is ADMIN in members.

        const memberEntry = project.members.find(m => m.user.toString() === req.user._id.toString());
        const isAdmin = memberEntry && memberEntry.role === 'ADMIN';

        if (project.owner.toString() !== req.user._id.toString() && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admins can update the project' });
        }

        if (name) project.name = name;
        if (description !== undefined) project.description = description;

        await project.save();
        await project.populate('owner', 'username email avatarUrl');
        await project.populate('members.user', 'username email avatarUrl');

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });

    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ success: false, message: 'Error updating project', error: error.message });
    }
};

// POST /api/projects/:id/invite - Inviter un utilisateur
export const inviteUserToProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // Check if requester is ADMIN
        const requester = project.members.find(m => m.user.toString() === req.user._id.toString());
        if (!requester || requester.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only admins can invite users' });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if already member
        if (project.members.some(m => m.user.toString() === userToInvite._id.toString())) {
            return res.status(400).json({ success: false, message: 'User is already a member' });
        }

        // Add as MEMBER
        project.members.push({ user: userToInvite._id, role: 'MEMBER' });
        await project.save();

        await project.populate('members.user', 'username email avatarUrl');

        // Socket notification
        const io = req.app.get('io');
        io.to(id).emit('user_invited', {
            project: { _id: project._id, name: project.name },
            newMember: {
                _id: userToInvite._id,
                username: userToInvite.username,
                email: userToInvite.email,
                avatarUrl: userToInvite.avatarUrl,
                role: 'MEMBER'
            },
            invitedBy: { _id: req.user._id, username: req.user.username }
        });

        res.status(200).json({
            success: true,
            message: `${userToInvite.username} added as MEMBER`,
            data: project
        });

    } catch (error) {
        console.error('Invite user error:', error);
        res.status(500).json({ success: false, message: 'Error inviting user', error: error.message });
    }
};

// DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only owner can delete' });
        }

        await Task.deleteMany({ project: id });
        await project.deleteOne();

        const io = req.app.get('io');
        io.to(id).emit('project_deleted', { projectId: id });

        res.status(200).json({ success: true, message: 'Project deleted' });

    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ success: false, message: 'Error deleting project', error: error.message });
    }
};

// POST /api/projects/:id/leave
export const leaveProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Owner cannot leave' });
        }

        // Check membership
        if (!project.members.some(m => m.user.toString() === req.user._id.toString())) {
            return res.status(400).json({ success: false, message: 'Not a member' });
        }

        // Remove
        project.members = project.members.filter(m => m.user.toString() !== req.user._id.toString());

        // Remove from tasks assignments
        await Task.updateMany(
            { project: id, assignees: req.user._id },
            { $pull: { assignees: req.user._id } }
        );

        await project.save();

        const io = req.app.get('io');
        io.to(id).emit('user_left', { projectId: id, user: { _id: req.user._id } });

        res.status(200).json({ success: true, message: 'Left project successfully' });

    } catch (error) {
        console.error('Leave project error:', error);
        res.status(500).json({ success: false, message: 'Error leaving project', error: error.message });
    }
};
