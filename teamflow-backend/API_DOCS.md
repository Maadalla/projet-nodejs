# TeamFlow Backend - API Documentation

## 📍 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication Endpoints

### 1. Register (Inscription)
**POST** `/auth/register`

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "65abc...",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "https://ui-avatars.com/api/?name=johndoe&background=random"
  }
}
```

**Note:** Le cookie HttpOnly `token` est automatiquement défini.

---

### 2. Login (Connexion)
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "65abc...",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "https://ui-avatars.com/api/?name=johndoe&background=random"
  }
}
```

---

### 3. Get Current User
**GET** `/auth/me`

**Headers:** Cookie avec token (automatique)

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "65abc...",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "https://ui-avatars.com/api/?name=johndoe&background=random"
  }
}
```

---

### 4. Logout (Déconnexion)
**POST** `/auth/logout`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 📁 Project Endpoints

### 1. Create Project
**POST** `/projects`

**Headers:** Authentification requise (cookie)

**Body:**
```json
{
  "name": "Mon Premier Projet",
  "description": "Description du projet"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "65proj...",
    "name": "Mon Premier Projet",
    "description": "Description du projet",
    "owner": {
      "_id": "65abc...",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarUrl": "..."
    },
    "members": [
      {
        "_id": "65abc...",
        "username": "johndoe",
        "email": "john@example.com",
        "avatarUrl": "..."
      }
    ],
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-19T10:00:00.000Z"
  }
}
```

---

### 2. Get All User Projects
**GET** `/projects`

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65proj...",
      "name": "Mon Premier Projet",
      "description": "...",
      "owner": { ... },
      "members": [ ... ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 3. Get Project by ID (avec tasks)
**GET** `/projects/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65proj...",
    "name": "Mon Premier Projet",
    "description": "...",
    "owner": { ... },
    "members": [ ... ],
    "tasks": [
      {
        "_id": "65task...",
        "taskId": "TASK-ABC123",
        "title": "Ma première tâche",
        "description": "...",
        "status": "TODO",
        "priority": "HIGH",
        "assignees": [ ... ],
        "position": 0,
        "createdAt": "..."
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 4. Update Project
**PATCH** `/projects/:id`

**Permissions:** Seulement le owner

**Body:**
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { ... }
}
```

---

### 5. Invite User to Project
**POST** `/projects/:id/invite`

**Body:**
```json
{
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "jane has been added to the project",
  "data": {
    "_id": "65proj...",
    "members": [
      { ... },
      {
        "_id": "65user2...",
        "username": "jane",
        "email": "jane@example.com",
        "avatarUrl": "..."
      }
    ]
  }
}
```

**Socket.io Event Emitted:**
```javascript
{
  event: 'user_invited',
  data: {
    project: { _id: "...", name: "..." },
    newMember: { ... },
    invitedBy: { ... }
  }
}
```

---

### 6. Leave Project
**POST** `/projects/:id/leave`

**Response (200):**
```json
{
  "success": true,
  "message": "You have left the project successfully"
}
```

---

### 7. Delete Project
**DELETE** `/projects/:id`

**Permissions:** Seulement le owner

**Response (200):**
```json
{
  "success": true,
  "message": "Project and all associated tasks deleted successfully"
}
```

---

## ✅ Task Endpoints

### 1. Get All Tasks of a Project
**GET** `/tasks?projectId=65proj...`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65task...",
      "taskId": "TASK-ABC123",
      "title": "Implémenter authentification",
      "description": "...",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "project": "65proj...",
      "assignees": [
        {
          "_id": "65user...",
          "username": "johndoe",
          "email": "john@example.com",
          "avatarUrl": "..."
        }
      ],
      "position": 1,
      "dueDate": "2026-01-25T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 2. Create Task
**POST** `/tasks`

**Body:**
```json
{
  "title": "Nouvelle tâche",
  "description": "Description de la tâche",
  "priority": "MEDIUM",
  "project": "65proj...",
  "assignees": ["65user..."],
  "dueDate": "2026-01-25"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Socket.io Event:** `task_created`

---

### 3. Update Task
**PATCH** `/tasks/:id`

**Body:**
```json
{
  "title": "Titre mis à jour",
  "description": "...",
  "priority": "HIGH",
  "assignees": ["65user1...", "65user2..."],
  "dueDate": "2026-01-30"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Socket.io Event:** `task_updated`

---

### 4. Update Task Status (Drag & Drop) 🔥
**PATCH** `/tasks/:id/status`

**Body:**
```json
{
  "status": "IN_PROGRESS",
  "position": 2,
  "sourceStatus": "TODO"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Task status updated successfully"
}
```

**Socket.io Event Emitted:**
```javascript
{
  event: 'task_moved',
  data: {
    taskId: "65task...",
    task: { ... },
    oldStatus: "TODO",
    newStatus: "IN_PROGRESS",
    oldPosition: 0,
    newPosition: 2,
    movedBy: {
      _id: "65user...",
      username: "johndoe"
    }
  }
}
```

---

### 5. Delete Task
**DELETE** `/tasks/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Socket.io Event:** `task_deleted`

---

### 6. Get Task by ID
**GET** `/tasks/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65task...",
    "taskId": "TASK-ABC123",
    "title": "...",
    "assignees": [ ... ],
    "project": {
      "_id": "65proj...",
      "name": "Mon Projet"
    }
  }
}
```

---

## 🔌 Socket.io Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join_project` | `projectId: string` | Rejoindre un projet pour recevoir les mises à jour |
| `leave_project` | `projectId: string` | Quitter un projet |

### Server → Client

| Event | Description |
|-------|-------------|
| `task_created` | Une nouvelle tâche a été créée |
| `task_updated` | Une tâche a été modifiée |
| `task_moved` | **Une tâche a changé de colonne (drag & drop)** |
| `task_deleted` | Une tâche a été supprimée |
| `user_invited` | Un utilisateur a été invité au projet |
| `user_left` | Un utilisateur a quitté le projet |
| `project_deleted` | Le projet a été supprimé |

---

## ⚠️ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token provided",
  "statusCode": 401
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "You are not a member of this project",
  "statusCode": 403
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Project not found",
  "statusCode": 404
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error creating task",
  "statusCode": 500,
  "error": "...",
  "stack": "..." // En mode développement seulement
}
```

---

## 🧪 Testing avec cURL

### S'inscrire
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"123456"}' \
  -c cookies.txt
```

### Se connecter
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}' \
  -c cookies.txt
```

### Créer un projet
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Project","description":"My first project"}'
```

### Créer une tâche
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Task","project":"PROJECT_ID_HERE","priority":"HIGH"}'
```
