import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import bcrypt from 'bcrypt';

const TAG_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('📦 Database already populated. Skipping seed.');
            return;
        }

        console.log('🌱 Seeding database with dummy data...');

        // 1. Create Users
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const usersData = [
            { username: 'Admin', email: 'admin@teamflow.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
            { username: 'Alice', email: 'alice@teamflow.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
            { username: 'Bob', email: 'bob@teamflow.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
            { username: 'Charlie', email: 'charlie@teamflow.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
            { username: 'Diana', email: 'diana@teamflow.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana' },
        ];

        const users = {};
        for (const u of usersData) {
            const user = await User.create({ ...u, passwordHash });
            users[u.username] = user;
        }
        console.log(`✅ Created ${usersData.length} users.`);

        // 2. Create Projects
        const project1 = await Project.create({
            name: 'Lancement App Beta',
            description: 'Phase finale avant le lancement public.',
            members: [
                { user: users['Admin']._id, role: 'ADMIN' },
                { user: users['Alice']._id, role: 'MEMBER' },
                { user: users['Bob']._id, role: 'MEMBER' },
                { user: users['Charlie']._id, role: 'MEMBER' },
            ],
            owner: users['Admin']._id
        });

        const project2 = await Project.create({
            name: 'Campagne Marketing 2026',
            description: 'Stratégie réseaux sociaux et ads.',
            members: [
                { user: users['Admin']._id, role: 'ADMIN' },
                { user: users['Diana']._id, role: 'MEMBER' },
                { user: users['Alice']._id, role: 'MEMBER' },
            ],
            owner: users['Admin']._id
        });
        console.log('✅ Created 2 projects.');

        // 3. Create Tasks for Project 1
        const tasksP1 = [
            {
                title: 'Design de la Home Page',
                description: 'Refaire la maquette Figma avec le nouveau logo.',
                status: 'DONE',
                priority: 'HIGH',
                assignees: [users['Alice']._id],
                dueDate: new Date(Date.now() + 86400000), // +1 day
                tags: [{ name: 'Design', color: TAG_COLORS[5] }, { name: 'UI/UX', color: TAG_COLORS[3] }]
            },
            {
                title: 'Configuration Serveur Production',
                description: 'Mise en place du VPS et Docker.',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assignees: [users['Bob']._id],
                dueDate: new Date(Date.now() + 172800000), // +2 days
                tags: [{ name: 'DevOps', color: TAG_COLORS[0] }]
            },
            {
                title: 'Tests End-to-End',
                description: 'Ecrire les tests Cypress pour le parcours inscription.',
                status: 'TODO',
                priority: 'MEDIUM',
                assignees: [users['Charlie']._id],
                dueDate: new Date(Date.now() + 432000000), // +5 days
                tags: [{ name: 'QA', color: TAG_COLORS[2] }]
            },
            {
                title: 'Rédaction Documentation API',
                description: 'Documenter les endpoints Swagger.',
                status: 'TODO',
                priority: 'LOW',
                assignees: [], // Unassigned
                tags: [{ name: 'Docs', color: TAG_COLORS[4] }]
            }
        ];

        for (const t of tasksP1) {
            await Task.create({ ...t, project: project1._id, position: 0 });
        }

        // 4. Create Tasks for Project 2
        const tasksP2 = [
            {
                title: 'Contenu Instagram Janvier',
                status: 'IN_PROGRESS',
                priority: 'MEDIUM',
                assignees: [users['Diana']._id],
                tags: [{ name: 'Social', color: TAG_COLORS[5] }]
            },
            {
                title: 'Budget Publicité Q1',
                status: 'TODO',
                priority: 'HIGH',
                assignees: [users['Alice']._id],
                tags: [{ name: 'Finance', color: TAG_COLORS[1] }]
            }
        ];

        for (const t of tasksP2) {
            await Task.create({ ...t, project: project2._id, position: 0 });
        }

        console.log('✅ Created sample tasks.');
        console.log('🎉 Database seeding completed!');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
};

export default seedDatabase;
