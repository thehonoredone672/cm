# CodeMatch Developer Guide

Welcome to the **CodeMatch** developer onboarding guide. This manual outlines the project's system design, database architecture, folder structure, API routing endpoints, socket streams, sandboxed code execution, and testing specifications.

---

## 1. Project Overview

### Architecture
CodeMatch uses a decoupled client-server architecture. The server acts as a RESTful JSON API provider and WebSocket emitter, while the frontend is a single-page application (SPA) that communicates with the API endpoints asynchronously.

```mermaid
graph TD;
    Client[React 19 Frontend] -->|HTTPS REST| Express[Express.js Server]
    Client -->|WebSockets| SocketServer[Socket.IO Server]
    Express -->|Prisma ORM| DB[(PostgreSQL Database)]
    Express -->|REST Sandbox| Judge0[Judge0 Sandbox Execution Engine]
```

### Technology Stack
* **Backend**: Node.js, Express.js, Prisma ORM, Socket.IO, JWT.
* **Frontend**: React 19, Vite, Axios, React Router 6, Framer Motion.
* **Database**: PostgreSQL.
* **Sandbox Compiler**: Judge0 API.

### Design Principles
1. **Separation of Concerns**: Keep business logic out of controllers and place it entirely inside services.
2. **Stateless JWT Sessions**: Authorize API access via Bearer tokens passed inside request header keys.
3. **Data Integrity**: Validate input payloads using Zod schemas before controllers handle them.
4. **Optimistic UI Updates**: Emit events using WebSockets to synchronize states in real-time.

### Folder Structure
```
codematch/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma Schema Definition
│   │   └── seed.js                # Core database seeder script
│   └── src/
│       ├── app.js                 # Express Application configurations
│       ├── server.js              # Node.js Server & Socket listener initialization
│       ├── middleware/            # Auth guards & payload validators
│       ├── socket/                # Socket.IO handlers
│       └── modules/               # Feature domains (auth, problems, search)
└── frontend/
    ├── src/
    │   ├── api/                   # Axios interceptors configuration
    │   ├── context/               # React Auth & Socket Providers
    │   ├── layouts/               # Dashboard Layout panels
    │   ├── pages/                 # Routing view files
    │   └── services/              # API path bindings modules
```

---

## 2. Local Development

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### Install Dependencies
Run the install command in both directories:
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Variables
Create a `.env` file in `backend/`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codematch?schema=public"
JWT_SECRET="supersecretjwtkey"
JUDGE0_API_URL="https://api.judge0.com"
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL="http://localhost:5000/api"
```

### Database Setup & Seeding
Format schema, push changes to PostgreSQL, and seed mock data:
```powershell
cd backend
npx prisma db push
node prisma/seed.js
```

### Running the Project
```powershell
# Run Backend (Dev mode with Nodemon)
cd backend
npm run dev

# Run Frontend (Vite server)
cd frontend
npm run dev
```

---

## 3. Project Architecture

### Request Lifecycle
```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware
    participant Validator
    participant Controller
    participant Service
    participant Database

    Client->>AuthMiddleware: GET /api/problems (Bearer JWT)
    AuthMiddleware-->>Client: 401 Unauthorized (invalid token)
    AuthMiddleware->>Validator: Validate Schema (if POST/PUT)
    Validator-->>Client: 400 Bad Request (validation errors)
    Validator->>Controller: Route to Controller Handler
    Controller->>Service: Call business logic methods
    Service->>Database: Query records via Prisma
    Database-->>Service: Return DB data
    Service-->>Controller: Return formatted payload
    Controller-->>Client: Send 200 OK JSON response
```

### WebSocket Event Stream Lifecycle
1. User connects and authentication token is verified inside Socket.IO handshake middleware.
2. Connection joins a room named after their unique `userId`.
3. Server emits events on specific actions (e.g. `notification:new` or `receive_message`).

---

## 4. Database Schema

### Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    User ||--o{ Submission : submits
    User ||--o{ UserBadge : earns
    User ||--o{ SearchHistory : saves
    Problem ||--o{ Submission : contains
    Problem ||--o{ Solution : contains
```

### Key Models

#### User
Stores credentials, gamified XP parameters, Streaks and Profile information.
- **Fields**: `id`, `email`, `xp`, `level`, `streak`, `longestStreak`.

#### Submission
Logs user sandbox compilation verdict metrics.
- **Fields**: `id`, `code`, `status` (ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED), `executionTime`, `memoryUsage`.

#### Contest
Tracks schedules and registration scopes.
- **Fields**: `id`, `title`, `startTime`, `endTime`, `status` (ACTIVE, UPCOMING, COMPLETED).

---

## 5. Backend Modules

### 1. Global Search
* **Purpose**: Performs platform-wide searches across multiple models (Students, Teams, Projects, Problems, Contests).
* **Routes**:
  * `GET /api/search` — Runs queries and returns categorized lists.
  * `GET /api/search/suggestions` — Autocomplete terms finder.
  * `GET /api/search/history` — Fetch user search history.
  * `DELETE /api/search/history/:id` — Clear a single search log.
  * `DELETE /api/search/history` — Clear all search logs.
  * `GET /api/search/trending` — Top 5 trending search queries.

---

## 6. Frontend Architecture

### Context Providers
* **AuthContext**: Manages login states, persists tokens in LocalStorage, and exports current `user` configurations.
* **SocketContext**: Holds the active WebSocket connections and exports connection statuses.

### Protected Routing
Wrap restricted views in `ProtectedRoute` component to redirect anonymous users to the `/login` path.
```javascript
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

---

## 7. Socket.IO Events Reference

| Event Name | Namespace | Direction | Payload Example | Purpose |
|---|---|---|---|---|
| `notification:new` | `/` | Server -> Client | `{ id, title, message }` | Appends a new unread alert. |
| `notification:read` | `/` | Server -> Client | `{ id, isRead: true }` | Marks an alert read dynamically. |
| `receive_message` | `/` | Server -> Client | `{ id, text, senderId }` | Appends a chat message in real-time. |

---

## 8. Sandbox Compilation Engine (Judge0)

### Code Execution Flow
```mermaid
sequenceDiagram
    participant Developer
    participant Backend
    participant Judge0
    
    Developer->>Backend: Submit Javascript code
    Backend->>Judge0: POST /submissions?wait=true (code, input)
    Judge0-->>Backend: 200 OK (stdout, status_id, time, memory)
    Backend-->>Developer: Render verdict status
```

---

## 9. Security Implementations
- **JWT Authorization**: Signed using `HS256`. Bounded inside cookies or Authorization headers.
- **Zod Schema Validations**: Sanitizes data types and strings lengths before controller execution.
- **Password Encryption**: Scrambles passwords using `bcryptjs` with a work factor of 10.

---

## 10. Contributing

### Git Commit Guidelines
Follow the conventional commits standard:
* `feat(...)`: A new feature block.
* `fix(...)`: A bug correction.
* `docs(...)`: Documentation additions.

---

## 11. Troubleshooting

| Symptom | Probable Cause | Resolution |
|---|---|---|
| Database Lock on Seed | Dangling Node process locks DB connection pool. | Stop process and restart database service. |
| Socket Disconnects | Mismatched ports or missing handshake headers. | Check CORS config in `server.js` and Vite proxies. |
