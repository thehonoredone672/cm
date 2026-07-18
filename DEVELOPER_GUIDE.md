# CodeMatch Developer Guide

Welcome to the developer guide for the CodeMatch platform. This document provides a complete walkthrough of the project, including its architecture, local development setup, codebase design patterns, and deployment configurations.

---

## 1. Project Overview

### Architecture
CodeMatch is a collaborative platform for competitive programming, profile compatibility matching, and developer teaming. It uses a decoupled client-server architecture:
- **Client (Frontend)**: React SPA built using Vite.
- **Server (Backend)**: Node.js with Express.js exposing REST endpoints.
- **Realtime (WebSocket)**: Socket.IO server mounted on top of the HTTP daemon.
- **Database**: PostgreSQL managed via Prisma ORM.
- **Sandbox execution**: Judge0 API for running and validating student source codes securely.

```mermaid
graph TD;
    Client[React Frontend] -->|HTTP REST / JWT| Express[Express Backend]
    Client -->|Socket.IO| SocketServer[Socket.IO Server]
    Express -->|Prisma Client| PG[(PostgreSQL DB)]
    Express -->|Sandbox Runs| Judge0[Judge0 API Engine]
```

### Technology Stack
- **Backend Core**: Node.js, Express.js
- **Database & ORM**: PostgreSQL, Prisma ORM
- **WebSocket Engine**: Socket.IO
- **Security**: JSON Web Tokens (JWT), Bcrypt.js, Zod
- **Frontend Core**: React 19, Vite, Framer Motion
- **HTTP Client**: Axios with Interceptors
- **State Management**: Context API (Auth, Socket)
- **CSS System**: Plain CSS with CSS Custom Properties variables

### Folder Structure
```
codematch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma schema models definition
│   │   ├── migrations/            # SQL migration history files
│   │   └── seed.js                # Database seeder scripts
│   └── src/
│       ├── app.js                 # App configuration & REST routing registers
│       ├── server.js              # Entrypoint server execution
│       ├── socket/                # Socket.IO event registrations
│       ├── middleware/            # JWT authentication & request validation middleware
│       └── modules/               # Domain-driven backend folders (auth, chat, notifications)
└── frontend/
    ├── src/
    │   ├── api/                   # Base Axios setups
    │   ├── components/            # UI components (Chat, layout, modals)
    │   ├── context/               # React contexts providers
    │   ├── pages/                 # Full router page views
    │   └── services/              # API fetch caller services modules
```

---

## 2. Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### Install Dependencies
Run the install command in both directories:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Variables
Configure the backend `.env` file:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codematch?schema=public"
JWT_SECRET="your_jwt_secret_key"
JUDGE0_API_URL="https://api.judge0.com"
```

Configure the frontend `.env` file:
```env
VITE_API_URL="http://localhost:5000/api"
```

### Database Seeding & Setup
```bash
cd backend
npx prisma db push
node prisma/seed.js
```

---

## 3. Project Architecture & Lifecycles

### Request Lifecycle
```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware
    participant Controller
    participant Service
    participant Database

    Client->>AuthMiddleware: REST Request (with JWT)
    AuthMiddleware-->>Client: 401 Unauthorized (if invalid)
    AuthMiddleware->>Controller: Invokes handler
    Controller->>Service: Invokes business logic
    Service->>Database: DB Query (Prisma)
    Database-->>Service: Query result
    Service-->>Controller: Domain object
    Controller-->>Client: HTTP response (JSON)
```

---

## 4. Notifications Module Reference

### API Reference
- `GET /api/notifications` — Fetches user notifications.
- `PATCH /api/notifications/read` — Marks all notifications as read.
- `PATCH /api/notifications/:id/read` — Marks a specific notification as read.
- `DELETE /api/notifications` — Clears all notifications.
- `DELETE /api/notifications/:id` — Deletes a notification.
- `GET /api/notifications/preferences` — Gets settings configurations.
- `PUT /api/notifications/preferences` — Updates preferences.

### Socket.IO Channels
- `notification:new` — Realtime notification alert broadcast.
- `notification:read` — Broadcast of read notification event.
- `notification:delete` — Broadcast of deleted notification event.
- `notification:update` — Batch notification read/deleted updates.
