# TeamFlow Frontend - Setup Guide

## 📁 Structure Créée

```
teamflow-frontend/
├── src/
│   ├── api/
│   │   └── axios.js              # ✅ Instance Axios avec withCredentials
│   ├── components/
│   │   ├── auth/
│   │   │   └── RequireAuth.jsx   # ✅ Route protégée
│   │   └── layout/
│   │       ├── Layout.jsx        # ✅ Wrapper principal
│   │       └── Sidebar.jsx       # ✅ Navigation latérale
│   ├── pages/
│   │   ├── Dashboard.jsx         # ✅ Page d'accueil
│   │   ├── Login.jsx             # ✅ Connexion
│   │   ├── Projects.jsx          # ✅ Liste projets
│   │   └── Register.jsx          # ✅ Inscription
│   ├── store/
│   │   └── useAuthStore.js       # ✅ Store Zustand auth
│   ├── App.jsx                   # ✅ Routing principal
│   ├── main.jsx                  # ✅ Point d'entrée
│   └── index.css                 # ✅ Styles Tailwind + customs
├── tailwind.config.js            # ✅ Configuration Tailwind
├── postcss.config.js             # ✅ Configuration PostCSS
└── package.json                  # ✅ Dépendances
```

## 🚀 Démarrage

### 1. Backend (Terminal 1)
```bash
cd teamflow-backend
npm run dev
```

### 2. Frontend (Terminal 2)
```bash
cd teamflow-frontend
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## 🎨 Design System

### Couleurs (Tailwind)
- **Primary**: `#6366f1` (Indigo 500)
- **Dark**: `#0f172a` (Slate 900 - Sidebar)
- **Light**: `#f8fafc` (Slate 50 - Fond)

### Police
- **Inter** (Google Fonts) - Poids : 300, 400, 500, 600, 700

## 🔐 Configuration Axios

L'instance Axios est configurée avec :
- `baseURL: 'http://localhost:5000/api'`
- **`withCredentials: true`** ⚡ CRITIQUE pour les cookies HttpOnly
- Intercepteurs pour logging et gestion d'erreurs

## 📦 Store Zustand

### État
```javascript
{
  user: null | User,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

### Actions
- `fetchUser()` - Charger utilisateur depuis `/auth/me`
- `login(email, password)` - Connexion
- `register(username, email, password)` - Inscription
- `logout()` - Déconnexion
- `clearError()` - Réinitialiser erreur

## 🗺️ Routing

| Route | Protection | Composant |
|-------|-----------|-----------|
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/` | Protected | Dashboard |
| `/projects` | Protected | Projects |

### RequireAuth
- Vérifie `isAuthenticated`
- Affiche loader pendant `isLoading`
- Redirige vers `/login` si non authentifié
- Sauvegarde la destination pour redirection post-login

## 🎯 Pages Créées

### Login (`/login`)
- Formulaire email + password
- Validation erreurs
- Lien vers Register
- Redirection après connexion

### Register (`/register`)
- Formulaire username + email + password + confirmation
- Validation frontend (mot de passe 6+ caractères, correspondance)
- Lien vers Login
- Création de compte automatique

### Dashboard (`/`)
- Message de succès de connexion
- Cartes statistiques (placeholder)
- Layout avec Sidebar

### Projects (`/projects`)
- État vide pour créer projet
- Prêt pour intégration CRUD projets

## 🎨 Composants Layout

### Sidebar
- Fixe à gauche (250px)
- Fond sombre (`bg-dark-900`)
- Navigation avec icônes (Lucide React)
- Section utilisateur en bas
- Avatar dynamique
- Bouton logout

### Layout
- Wrapper principal
- Sidebar + zone de contenu
- `<Outlet />` pour le routing imbriqué

## 🧪 Test de l'application

1. **Démarrer les serveurs** (backend + frontend)
2. **Naviguer vers** `http://localhost:5173`
3. **Créer un compte** via `/register`
4. **Vérifier la redirection** vers Dashboard
5. **Vérifier la Sidebar** avec votre avatar
6. **Naviguer** vers Projects
7. **Se déconnecter** et vérifier la redirection vers Login

## ✅ Fonctionnalités Complètes

- [x] Configuration Tailwind avec design system
- [x] Axios avec withCredentials pour cookies
- [x] Zustand store pour authentification
- [x] Routing avec protection
- [x] Pages Login/Register fonctionnelles
- [x] Layout responsive avec Sidebar
- [x] Inter font chargée
- [x] Scrollbar customisée
- [x] Gestion des erreurs
- [x] Loading states
- [x] Navigation active

## 🔜 Prochaine Étape

**ÉTAPE 4 : Kanban Board & Drag and Drop**

Le frontend est maintenant complètement configuré et l'authentification fonctionne. La prochaine étape consistera à :
1. Créer les composants Kanban (Board, Column, Card)
2. Intégrer `react-beautiful-dnd`
3. Implémenter la création/édition de tâches
4. Ajouter le système d'assignation
5. Connecter Socket.io pour temps réel
