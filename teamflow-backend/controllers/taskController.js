import Task from '../models/Task.js';
import Project from '../models/Project.js';

/**
 * TaskController - Gère toutes les opérations CRUD sur les tâches
 * avec support de Socket.io pour la collaboration temps réel
 */

// Helper to check membership
const isMember = (project, userId) => {
    return project.members.some(m => m.user.toString() === userId.toString());
};

// GET /api/tasks?projectId=xxx
export const getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) return res.status(400).json({ success: false, message: 'Project ID is required' });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (!isMember(project, req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not a member' });
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignees', 'username email avatarUrl')
            .populate('comments.user', 'username email avatarUrl') // Populate comments users
            .sort({ status: 1, position: 1 });

        res.status(200).json({ success: true, data: tasks });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
    }
};

// POST /api/tasks
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, project, assignees, dueDate, tags } = req.body;

        if (!title || !project) return res.status(400).json({ success: false, message: 'Title and project required' });

        const projectDoc = await Project.findById(project);
        if (!projectDoc) return res.status(404).json({ success: false, message: 'Project not found' });

        if (!isMember(projectDoc, req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not a member' });
        }

        const lastTask = await Task.findOne({ project, status: 'TODO' }).sort({ position: -1 });
        const position = lastTask ? lastTask.position + 1 : 0;

        const task = new Task({
            title,
            description,
            priority: priority || 'MEDIUM',
            project,
            assignees: assignees || [],
            position,
            dueDate: dueDate || null,
            tags: tags || []
        });

        await task.save();
        await task.populate('assignees', 'username email avatarUrl');

        const io = req.app.get('io');
        io.to(project).emit('task_created', {
            task,
            createdBy: { _id: req.user._id, username: req.user.username }
        });

        res.status(201).json({ success: true, data: task });

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Error creating task', error: error.message });
    }
};

// PATCH /api/tasks/:id
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not a member' });
        }

        const allowedUpdates = ['title', 'description', 'priority', 'assignees', 'dueDate', 'tags'];
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                task[key] = updates[key];
            }
        });

        await task.save();
        await task.populate('assignees', 'username email avatarUrl');
        await task.populate('comments.user', 'username email avatarUrl');

        const io = req.app.get('io');
        io.to(task.project.toString()).emit('task_updated', {
            task,
            updatedBy: { _id: req.user._id, username: req.user.username }
        });

        res.status(200).json({ success: true, data: task });

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Error updating task', error: error.message });
    }
};

// PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, position } = req.body;

        if (!status || position === undefined) {
            return res.status(400).json({ success: false, message: 'Status and position required' });
        }

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not a member' });
        }

        const oldStatus = task.status;
        const oldPosition = task.position;

        if (oldStatus !== status) {
            await Task.updateMany(
                { project: task.project, status: oldStatus, position: { $gt: oldPosition } },
                { $inc: { position: -1 } }
            );
            await Task.updateMany(
                { project: task.project, status: status, position: { $gte: position } },
                { $inc: { position: 1 } }
            );
            task.status = status;
            task.position = position;
        } else {
            if (position < oldPosition) {
                await Task.updateMany(
                    { project: task.project, status: status, position: { $gte: position, $lt: oldPosition } },
                    { $inc: { position: 1 } }
                );
            } else if (position > oldPosition) {
                await Task.updateMany(
                    { project: task.project, status: status, position: { $gt: oldPosition, $lte: position } },
                    { $inc: { position: -1 } }
                );
            }
            task.position = position;
        }

        await task.save();
        await task.populate('assignees', 'username email avatarUrl');
        await task.populate('comments.user', 'username email avatarUrl');

        const io = req.app.get('io');
        io.to(task.project.toString()).emit('task_moved', {
            taskId: task._id,
            task,
            oldStatus, newStatus: status,
            oldPosition, newPosition: position,
            movedBy: { _id: req.user._id, username: req.user.username }
        });

        res.status(200).json({ success: true, data: task });

    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ success: false, message: 'Error updating task status', error: error.message });
    }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return res.status(403).json({ success: false, message: 'Not a member' });

        const projectId = task.project;
        const status = task.status;
        const position = task.position;

        await task.deleteOne();

        await Task.updateMany(
            { project: projectId, status: status, position: { $gt: position } },
            { $inc: { position: -1 } }
        );

        const io = req.app.get('io');
        io.to(projectId.toString()).emit('task_deleted', {
            taskId: id,
            deletedBy: { _id: req.user._id, username: req.user.username }
        });

        res.status(200).json({ success: true, message: 'Task deleted' });

    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Error deleting task', error: error.message });
    }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id)
            .populate('assignees', 'username email avatarUrl')
            .populate('project', 'name')
            .populate('comments.user', 'username email avatarUrl');

        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return res.status(403).json({ success: false, message: 'Not a member' });

        res.status(200).json({ success: true, data: task });

    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ success: false, message: 'Error fetching task', error: error.message });
    }
};

// GET /api/tasks/:id/comments - Get comments
export const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate('comments.user', 'username email avatarUrl');

        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return res.status(403).json({ success: false, message: 'Not a member' });

        // Sort comments by date (oldest first)
        const comments = task.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Format for frontend (flattening the nested structure if needed, but frontend expects author keys?)
        // Task model: comments: [{ user: {...}, text: ..., createdAt: ... }]
        // Frontend TaskComments.jsx expects: comment.author....
        // So we need to map `user` to `author`.

        const formattedComments = comments.map(c => ({
            _id: c._id,
            text: c.text,
            createdAt: c.createdAt,
            author: c.user // Map user to author for frontend compatibility
        }));

        res.status(200).json({ success: true, count: formattedComments.length, data: formattedComments });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: 'Error fetching comments', error: error.message });
    }
};

// POST /api/tasks/:id/comments - Ajouter un commentaire
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ success: false, message: 'Comment text required' });

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return res.status(403).json({ success: false, message: 'Not a member' });

        // Add comment
        const comment = {
            user: req.user._id,
            text,
            createdAt: new Date()
        };
        task.comments.push(comment);
        await task.save();

        await task.populate('comments.user', 'username email avatarUrl');

        // Note: we just added the last comment, but populate populates all. 
        // We want to return the full task or just the new comment. 
        // The frontend expects the full task update usually.

        const io = req.app.get('io');
        io.to(task.project.toString()).emit('task_updated', {
            task, // sending full task with new comment
            updatedBy: { _id: req.user._id, username: req.user.username }
        });

        res.status(201).json({ success: true, data: task });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
    }
};

// Get tasks assigned to current user
export const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            assignees: req.user._id,
            status: { $ne: 'DONE' } // Only active tasks
        })
            .populate('project', 'name')
            .populate('assignees', 'username avatarUrl')
            .sort({ dueDate: 1 }); // Urgent first

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching my tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
