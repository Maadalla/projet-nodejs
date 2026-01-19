import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();
const httpServer = createServer(app);

// Configurer Socket.io avec CORS
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rendre Socket.io accessible dans les routes
app.set('io', io);

// Connexion à MongoDB
connectDB();

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes); // Will handle /api/tasks/:id/comments

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'TeamFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.io - Gestion des connexions temps réel
io.use((socket, next) => {
    // TODO: Ajouter l'authentification Socket.io dans la prochaine étape
    // Pour l'instant, on accepte toutes les connexions
    next();
});

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Rejoindre une room de projet
    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`👥 User ${socket.id} joined project: ${projectId}`);
    });

    // Quitter une room de projet
    socket.on('leave_project', (projectId) => {
        socket.leave(projectId);
        console.log(`👋 User ${socket.id} left project: ${projectId}`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

// Gestion des erreurs - Utiliser les middlewares d'erreur
app.use(notFound);       // Gérer les routes 404
app.use(errorHandler);   // Gestionnaire global d'erreurs

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
