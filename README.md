# 🚀 Collaboration Plateforme

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-MERN-informational.svg?style=for-the-badge)

> **La solution ultime pour la gestion de projet et la collaboration d'équipe en temps réel.**

---

## 🌟 À Propos

**Collaboration Plateforme** est une application web moderne de type Trello/Jira, conçue pour révolutionner la productivité des équipes. Construite avec la stack **MERN** (MongoDB, Express, React, Node.js), elle offre une expérience utilisateur fluide, réactive et esthétique.

Ce projet démontre une maîtrise avancée du développement Fullstack, intégrant des fonctionnalités complexes comme la **communication temps réel**, la **visualisation de données**, et une **architecture sécurisée**.

---

## ✨ Fonctionnalités Clés ("The Sauce")

### 🎨 Expérience Utilisateur Premium
*   **Interface Moderne** : Design épuré avec TailwindCSS, animations fluides et responsive design.
*   **Drag & Drop Kanban** : Gestion intuitive des tâches par glisser-déposer (@hello-pangea/dnd).
*   **Mode Planning** : Vue liste détaillée pour une gestion macroscopique.

### ⚡ Temps Réel & Collaboration
*   **Socket.io** : Mises à jour instantanées des tâches et commentaires sans rechargement.
*   **Système de Chat** : Commentaires en direct sur les tâches pour une communication fluide.
*   **Notifications** : Feedback visuel immédiat (Sonner Toasts).

### 🛡️ Sécurité & Gestion
*   **Authentification Robuste** : JWT (JSON Web Tokens) stockés sécurisés dans des cookies HTTP-only.
*   **RBAC (Role-Based Access Control)** : Gestion fine des permissions (Admin vs Membre).
*   **Profile Management** : Personnalisation complète du profil utilisateur (Avatar, Sécurité).

### 📊 Analytics & Données
*   **Tableau de Bord Intelligent** : Vue d'ensemble des tâches personnelles ("My Work Today").
*   **Project Analytics** : Graphiques interactifs (Recharts) pour la répartition des tâches et la charge de travail.
*   **Seeder Automatique** : Script intelligent de peuplement de données pour les démos.

---

## 🛠️ Stack Technique

C'est ici que la magie opère. Une architecture solide pour des performances optimales.

| Composant | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Zustand (State), React Query (Data Fetching), Recharts |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB, Mongoose (ODM) |
| **Sécurité** | Bcrypt, JWT, Cookie-Parser, CORS |
| **DevOps** | Nodemon, Concurrently, Scripts de Seeding |

---

## 🚀 Installation & Démarrage

Suivez ces étapes pour lancer la bête sur votre machine locale.

### Prérequis
*   Node.js (v16+)
*   MongoDB (Local ou Atlas)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-user/collaboration-plateforme.git
cd collaboration-plateforme
```

### 2. Installation des dépendances
Le projet est divisé en deux parties (Frontend & Backend).

**Racine / Backend :**
```bash
cd teamflow-backend
npm install
```

**Frontend :**
```bash
cd teamflow-frontend
npm install
```

### 3. Configuration (.env)
Créez un fichier `.env` dans le dossier **backend** :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/teamflow
JWT_SECRET=votre_super_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Lancement ("Ignition") 💥
Lancez le backend et le frontend en parallèle :

**Terminal 1 (Backend) :**
```bash
# Lance le serveur + Seed la base de données automatiquement !
npm run dev
```

**Terminal 2 (Frontend) :**
```bash
npm run dev
```

Accédez à l'application sur : `http://localhost:5173`

---



## 👥 Auteurs

Projet réalisé par :

Maadalla

---
