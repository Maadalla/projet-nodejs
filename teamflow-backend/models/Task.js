import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['TODO', 'IN_PROGRESS', 'DONE'],
            message: '{VALUE} is not a valid status'
        },
        default: 'TODO'
    },
    priority: {
        type: String,
        enum: {
            values: ['LOW', 'MEDIUM', 'HIGH'],
            message: '{VALUE} is not a valid priority'
        },
        default: 'MEDIUM'
    },
    tags: [{
        name: { type: String, required: true },
        color: { type: String, default: '#3b82f6' }
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Task must belong to a project']
    },
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    position: {
        type: Number,
        default: 0,
        min: 0
    },
    // Comments system
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    dueDate: {
        type: Date,
        validate: {
            validator: function (value) {
                // Due date must be in the future or today
                return !value || value >= new Date().setHours(0, 0, 0, 0);
            },
            message: 'Due date cannot be in the past'
        }
    }
}, {
    timestamps: true
});

// Compound index for efficient queries by project and status
taskSchema.index({ project: 1, status: 1, position: 1 });

// Virtual property for task ID display (e.g., TASK-12)
taskSchema.virtual('taskId').get(function () {
    return `TASK-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Ensure virtuals are included in JSON responses
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
