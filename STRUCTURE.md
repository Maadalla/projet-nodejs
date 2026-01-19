# TeamFlow - Structure du Projet

## 📁 Architecture Complète

```
projet-node/
├── teamflow-backend/          # Backend Node.js + Express + Socket.io
│   ├── config/
│   │   └── database.js        # ✅ Configuration MongoDB
│   ├── controllers/
│   │   ├── taskController.js  # ✅ ÉTAPE 1 - Logique métier des tâches
│   │   ├── authController.js  # ✅ ÉTAPE 2 - Authentification JWT
│   │   └── projectController.js # ✅ ÉTAPE 2 - Gestion projets
│   ├── models/
│   │   ├── User.js           # ✅ ÉTAPE 1 - Modèle utilisateur
│   │   ├── Project.js        # ✅ ÉTAPE 1 - Modèle projet
│   │   └── Task.js           # ✅ ÉTAPE 1 - Modèle tâche
│   ├── routes/
│   │   ├── taskRoutes.js     # ✅ ÉTAPE 1 - Routes tâches
│   │   ├── authRoutes.js     # ✅ ÉTAPE 2 - Routes auth
│   │   └── projectRoutes.js  # ✅ ÉTAPE 2 - Routes projets
│   ├── middleware/
│   │   ├── authMiddleware.js # ✅ ÉTAPE 1 - Protection JWT
│   │   └── errorMiddleware.js # ✅ ÉTAPE 2 - Gestion erreurs
│   ├── server.js             # ✅ ÉTAPE 1-2 - Point d'entrée serveur
│   ├── package.json          # ✅ ÉTAPE 1 - Dépendances
│   ├── .env.example          # ✅ ÉTAPE 1 - Template variables env
│   ├── .gitignore            # ✅ ÉTAPE 1
│   └── API_DOCS.md           # ✅ ÉTAPE 2 - Documentation API complète
│
└── teamflow-frontend/         # Frontend React + Vite (TODO: ÉTAPE 3)
    ├── public/
    │   └── logo.svg
    ├── src/
    │   ├── assets/           # Images, fonts, etc.
    │   ├── components/       # Composants réutilisables
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Header.jsx
    │   │   │   └── MainLayout.jsx
    │   │   ├── kanban/
    │   │   │   ├── KanbanBoard.jsx
    │   │   │   ├── KanbanColumn.jsx
    │   │   │   └── TaskCard.jsx
    │   │   ├── modals/
    │   │   │   └── TaskModal.jsx
    │   │   └── ui/
    │   │       ├── Button.jsx
    │   │       ├── Badge.jsx
    │   │       └── Avatar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── ProjectView.jsx
    │   ├── store/            # Zustand stores
    │   │   ├── authStore.js
    │   │   ├── projectStore.js
    │   │   └── taskStore.js
    │   ├── services/         # API calls & Socket.io
    │   │   ├── api.js
    │   │   ├── socket.js
    │   │   └── queries/
    │   │       ├── useTaskQueries.js
    │   │       └── useProjectQueries.js
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css         # Tailwind + Design System
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .gitignore
```

## ✅ ÉTAPE 1 - Fichiers Créés

### Backend Mongoose Models
- **User.js** : Username, email, passwordHash, avatarUrl
- **Project.js** : Name, description, owner, members[]
- **Task.js** : Title, description, status (enum), priority (enum), project, assignees[], position, dueDate

### Backend Controller
- **taskController.js** : 
  - `getTasks()` - Récupérer toutes les tâches d'un projet
  - `createTask()` - Créer une tâche
  - `updateTask()` - Mettre à jour une tâche
  - `updateTaskStatus()` - **CRITIQUE** : Gère le drag & drop avec émission Socket.io
  - `deleteTask()` - Supprimer une tâche
  - `getTaskById()` - Récupérer une tâche spécifique

### Logique updateTaskStatus
Cette fonction est le cœur du système Kanban :
1. Vérifie les permissions utilisateur
2. Réorganise les positions dans l'ancienne colonne (si changement de statut)
3. Insère la tâche à la nouvelle position dans la nouvelle colonne
4. Sauvegarde les changements en base de données
5. **Émet l'événement Socket.io `task_moved`** pour synchroniser tous les clients connectés

### Configuration
- **server.js** : Express + Socket.io configurés
- **database.js** : Connexion MongoDB
- **taskRoutes.js** : Routes API pour les tâches
- **authMiddleware.js** : Protection JWT (basique)

## 🔄 Événements Socket.io Implémentés

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `join_project` | Client → Server | Un utilisateur rejoint une room de projet |
| `leave_project` | Client → Server | Un utilisateur quitte une room de projet |
| `task_created` | Server → Clients | Une nouvelle tâche a été créée |
| `task_updated` | Server → Clients | Une tâche a été modifiée |
| `task_moved` | Server → Clients | **Une tâche a changé de colonne (drag & drop)** |
| `task_deleted` | Server → Clients | Une tâche a été supprimée |

## 📊 Schémas de Données

### Task Document (Exemple)
```json
{
  "_id": "65abc123...",
  "taskId": "TASK-ABC123",
  "title": "Implémenter l'authentification",
  "description": "Ajouter JWT avec cookies HttpOnly",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "project": "65abc000...",
  "assignees": [
    {
      "_id": "65user01...",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=johndoe"
    }
  ],
  "position": 2,
  "dueDate": "2026-01-25T00:00:00.000Z",
  "createdAt": "2026-01-19T10:00:00.000Z",
  "updatedAt": "2026-01-19T10:30:00.000Z"
}
```

## ✅ ÉTAPE 2 - Fichiers Créés

### Authentication Controller (`authController.js`)
Fonctionnalités complètes :
- **register()** : Inscription avec bcrypt hashing + génération automatique d'avatar UI-Avatars
- **login()** : Connexion avec vérification mot de passe et JWT
- **getMe()** : Récupération utilisateur connecté
- **logout()** : Déconnexion avec suppression du cookie
- **Cookies HttpOnly** : Protection XSS - Token stocké côté serveur uniquement

### Project Controller (`projectController.js`)
Fonctionnalités complètes :
- **createProject()** : Création avec owner automatique
- **getUserProjects()** : Liste des projets de l'utilisateur avec .populate()
- **getProjectById()** : Récupération projet + toutes ses tâches
- **updateProject()** : Modification (owner uniquement)
- **inviteUserToProject()** : Invitation par email avec événement Socket.io
- **leaveProject()** : Quitter un projet (sauf owner)
- **deleteProject()** : Suppression projet + tâches (owner uniquement)

### Error Middleware (`errorMiddleware.js`)
- **notFound()** : Middleware pour routes 404
- **errorHandler()** : Gestion centralisée avec :
  - Erreurs Mongoose (ValidationError, CastError, DuplicateKey)
  - Erreurs JWT (JsonWebTokenError, TokenExpiredError)
  - Stack trace en mode développement
  - Réponses JSON structurées

### Routes
- **authRoutes.js** : `/api/auth/register`, `/login`, `/me`, `/logout`
- **projectRoutes.js** : CRUD complet + `/invite`, `/leave`

### Configuration
- **User.js** : Mise à jour avatarUrl avec ui-avatars.com
- **server.js** : Intégration de tous les middlewares et routes
- **API_DOCS.md** : Documentation complète de l'API

## 🔐 Sécurité Implémentée

| Feature | Implementation |
|---------|----------------|
| Password Storage | Bcrypt avec salt de 10 rounds |
| JWT Storage | HttpOnly Cookies (pas de localStorage) |
| CORS | Configuré avec credentials |
| Cookie Settings | `httpOnly: true`, `sameSite: 'lax'`, `secure` en production |
| Token Expiration | 7 jours |
| Authorization | Middleware `protect` vérifie le token sur chaque requête |

## 🚀 Prochaines Étapes

**ÉTAPE 3** : Frontend Setup & Design System
- Initialiser Vite + React
- Configurer Tailwind CSS avec le Design System
- Setup Zustand + React Query
- Créer layout de base (Sidebar, Header, Canvas)

**ÉTAPE 4** : UI Components Kanban
- Task Card avec badges de priorité
- Colonnes Kanban (TODO, IN_PROGRESS, DONE)
- Drag & Drop avec react-beautiful-dnd
- Modal de détail de tâche
- Interface d'assignation

**ÉTAPE 5** : Integration & Testing
- Connecter Socket.io client
- Implémenter synchronisation temps réel
- Tests de collaboration multi-utilisateurs

