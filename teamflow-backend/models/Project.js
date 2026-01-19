import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project owner is required']
    },
    // Members with roles (RBAC)
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['ADMIN', 'MEMBER'],
            default: 'MEMBER'
        }
    }]
}, {
    timestamps: true
});

// Ensure owner is a member with ADMIN role
projectSchema.pre('save', function (next) {
    if (!this.members.find(m => m.user.toString() === this.owner.toString())) {
        this.members.push({ user: this.owner, role: 'ADMIN' });
    }
    next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
