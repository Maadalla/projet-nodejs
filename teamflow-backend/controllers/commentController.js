import Comment from '../models/Comment.js';
import Task from '../models/Task.js';

// Get comments for a task
export const getComments = async (req, res) => {
    try {
        const { id } = req.params; // taskId
        const comments = await Comment.find({ task: id })
            .populate('author', 'username email avatarUrl')
            .sort({ createdAt: 1 }); // Oldest first for chat history

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Create a comment
export const createComment = async (req, res) => {
    try {
        const { id } = req.params; // taskId
        const { text } = req.body;

        // Verify task exists
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Create comment
        const comment = await Comment.create({
            text,
            author: req.user._id,
            task: id
        });

        // Populate author details
        await comment.populate('author', 'username email avatarUrl');

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            // Emitting to project room as usual
            io.to(task.project.toString()).emit('comment_added', {
                comment,
                taskId: id
            });
        }

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
