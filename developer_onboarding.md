# CodeMatch - Developer Onboarding & Architecture Guide

Welcome to the CodeMatch development team! This guide explains every technical detail of the codebase, backend services, database layout, and frontend components to get you productive immediately.

---

## 📂 1. Project Directory Structure

```
d:/codematch/
├── backend/                  # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma database schemas & relationships
│   │   └── seed.js           # Database seed script for admins, students, and hackathons
│   ├── src/
│   │   ├── config/           # Database & server initializations
│   │   ├── middleware/       # Authentication, Rate Limiters, error standardizers
│   │   ├── modules/          # Business logic layers grouped by module
│   │   │   ├── admin/        # System status monitoring, user management
│   │   │   ├── ai/           # Code evaluation, resume review, skill gap analysis
│   │   │   ├── careers/      # Internship/Job listings & trackers
│   │   │   ├── chat/         # 1-to-1 and Group chats synchronizations
│   │   │   ├── community/    # Forums, posts, comments, and likes
│   │   │   ├── hackathons/   # Live developer events & registrations
│   │   │   ├── problems/     # Code editor challenges CRUD
│   │   │   ├── submissions/  # Code submissions runner (with Judge0 validation)
│   │   │   └── teams/        # Collaboration groups, roles & invites
│   │   ├── socket/           # Real-time message broadcasting logic
│   │   ├── app.js            # Express application routes registry
│   │   └── server.js         # Port listener & socket initializer
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/              # Axios service instance config
│   │   ├── components/       # Shared buttons, modals, input elements
│   │   ├── pages/            # View managers (Chat, Ecosystem, Profile, Admin)
│   │   ├── styles/           # Theme variables and global stylings
│   │   ├── App.jsx           # Main routing & state provider
│   │   └── main.jsx          # Entry point mounting elements
```

---

## 🗄️ 2. Database Models & Schema Design

Database relations are managed by **Prisma** targeting a **PostgreSQL** instance. Key relationships:

### A. Core User Account
- `User`: Handles details, biographies, github links, academic streaks, and roles (`STUDENT`, `ADMIN`).
- Administrators (`role: ADMIN`) are excluded from matchmaking lists, search lists, and cannot receive invitations or direct chats.

### B. Collaboration & Chatting
- `Team`: Groups of developers matching together.
- `TeamMember`: Joins users to teams with roles (`LEADER`, `ADMIN`, `MEMBER`).
- `Conversation`: Tracks messaging channels. Has a `teamId` and `name` if it's a Team Group Chat.
- `ConversationParticipant`: Joins users to Conversations. Synchronized automatically on team join/leave events.
- `Message`: Sent chats. Stores image links and attachments.

### C. Challenges & Runs
- `Problem`: Competitive coding challenges. Contains starter code JSON and public/hidden test cases.
- `Submission`: Code execution results (Accepted, Compilation Error, Runtime Error, etc.).
- `DailyChallenge`: Linked 1-to-1 with a problem, refreshed daily.

### D. Platform Ecosystem
- `CommunityPost`: Forum posts. Connects to `PostLike` and `PostComment` for engagement tracking.
- `LearningResource`: Roadmaps, tutorials, and articles. Bookmarked via `BookmarkedResource`.
- `JobListing`: Internships or jobs. Tracked via `JobApplication` status (`PENDING`, `SAVED`, `APPLIED`).

---

## 🔐 3. Authentication & Security Layers

1. **JSON Web Tokens (JWT)**: Login generates a token stored in localStorage (frontend). The backend `protect` middleware decodes this token to verify request authenticity.
2. **Security Headers**: `Helmet` is mounted inside `app.js` to secure response headers against script injection.
3. **Throttling (Rate Limiting)**: `express-rate-limit` prevents request spam:
   - Auth endpoints `/api/auth/*`: Max 30 attempts per 15 minutes.
   - Global endpoints `/api/*`: Max 200 requests per 15 minutes.
4. **Central Error Fallback**: All express handler errors pass to `errorMiddleware`. Unknown routes hit the 404 handler, returning a standardized JSON schema:
   ```json
   { "success": false, "message": "Reason details" }
   ```

---

## 🖥️ 4. Frontend Theme System

We use a high-contrast **minimalist monochrome theme** (black, white, and carbon-grays). CSS variables are loaded globally from [theme.css](file:///d:/codematch/frontend/src/styles/theme.css):

- `--background`: Primary dark canvas background.
- `--surface`: Card surfaces.
- `--border`: Fine lines separating columns.
- `--primary`: Highlight states (white/pure silver).
- `--text-primary`: Pure white content text.
- `--text-secondary`: Carbon gray details.

*Rule: Never hardcode blue, green, or red hex codes. Always use theme variables or glow colors (`var(--success)`, `var(--danger)`).*

---

## 🚀 5. Quick Start Instructions

Follow these steps to run the environment locally:

### Step 1: Install Dependencies
```bash
# Inside backend folder
cd backend
npm install

# Inside frontend folder
cd ../frontend
npm install
```

### Step 2: Database Setup & Sync
Create a `.env` file in the `backend/` folder specifying your database URL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codematch?schema=public"
JWT_SECRET="yoursecretkey"
PORT=5000
```
Run migrations:
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

### Step 3: Run Database Seeds
```bash
node prisma/seed.js
```

### Step 4: Launch Dev Servers
```bash
# Terminal 1: Run Backend
cd backend
npm run dev

# Terminal 2: Run Frontend
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.
