# CODEMATCH_FRONTEND_GUIDE.md

# Purpose

This document explains how the CodeMatch frontend should be designed and connected to the backend.

Audience:

* Frontend Developers
* UI/UX Designers
* Future Contributors

---

# Design Philosophy

CodeMatch is:

LeetCode + GitHub + LinkedIn + Student Matrimony

The design should feel:

* Professional
* Modern
* Student Friendly
* Fast
* Clean

Avoid:

* Excessive animations
* Heavy gradients
* Cluttered layouts

Focus on:

* Matching
* Team Building
* Collaboration

---

# Primary Colors



---

# Layout Structure

Desktop

Sidebar
|
|-- Dashboard
|-- Profile
|-- Matches
|-- Team Requests
|-- Applications
|-- Chat
|-- Settings

Top Navbar

* User Avatar
* Search
* Notifications

Main Content Area

---

# Mobile Layout

Bottom Navigation

Dashboard
Matches
Teams
Chat
Profile

---

# Screens

1. Authentication

* Login
* Register

2. Dashboard

* Match Summary
* Team Requests Summary
* Recent Activity

3. Profile

* Personal Information
* Skills
* Interests

4. Matches

* Match Cards
* Compatibility Score
* Shared Skills
* Shared Interests

5. Team Requests

* Browse Requests
* Create Request

6. Applications

* Sent Applications
* Received Applications

7. Chat

* Conversations
* Messages

---

# Match Card Design

Card

Name
College

Compatibility Score

Shared Skills

Shared Interests

Buttons

* View Profile
* Chat
* Invite

---

# API Integration Rules

Authentication

Store JWT in local storage.

Attach token:

Authorization: Bearer TOKEN

For every protected request.

---

# Frontend Folder Structure

src/

api/
components/
layouts/
pages/
hooks/
routes/
context/
utils/

---

# MVP UI Priority

Priority 1

* Login
* Register
* Dashboard
* Profile

Priority 2

* Matches
* Team Requests

Priority 3

* Applications
* Chat

---

# Future Enhancements

* Dark Mode
* AI Match Suggestions
* Recruiter Portal
* Coding Challenges
* Leaderboards
* Video Calls

### Team Requests Screen

Features:

- Create Request
- Browse Requests
- View Request Details

Card Layout:

Title

Description

Required Skills

Duration

Creator

### Create Team Request Screen

Fields:

- Title
- Description
- Duration

Buttons:

- Create Request

API:

POST /api/team-requests

# CodeMatch Frontend Guide

## Product Vision

CodeMatch helps students find project teammates, hackathon partners, and coding collaborators based on skills and interests.

Think:

LinkedIn + GitHub + Student Matrimony

---

## MVP Pages

### Public Pages

1. Landing Page
2. Login Page
3. Register Page

---

### Protected Pages

4. Dashboard

Shows:

* Profile Summary
* Matches
* Team Requests

---

5. Profile Page

Features:

* Edit Profile
* Skills
* Interests
* GitHub URL
* LinkedIn URL

---

6. Matches Page

Shows:

* Compatibility Score
* Skills Match
* Interests Match

Actions:

* View Profile
* Start Chat

---

7. Team Requests Page

Shows:

* Open Team Requests
* Create Team Request

---

8. Applications Page

Shows:

* Applied Requests
* Applicants
* Accept / Reject Actions

---

9. Chat Page

Sidebar:

* Conversations

Main Area:

* Messages
* Input Box
* Send Button

---

## Recommended Stack

React
React Router
Axios
Context API

Optional:

Socket.IO Client
React Query

---

---

## UI Principles

* Mobile First
* Fast Loading
* Minimal Design
* Student Friendly
* Simple Navigation

---

## API Base URL

Development

http://localhost:5000/api

Deployment

https://api.codematch.com/api

---

Status

Frontend Development Ready

src/

├── api/
│   └── axios.js

├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── ProtectedRoute.jsx
│   └── Loading.jsx

├── context/
│   ├── AuthContext.jsx
│   └── SocketContext.jsx

├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Matches.jsx
│   ├── TeamRequests.jsx
│   ├── Applications.jsx
│   └── Chat.jsx

├── services/
│   ├── authService.js
│   ├── userService.js
│   ├── skillService.js
│   ├── interestService.js
│   ├── matchService.js
│   ├── teamService.js
│   ├── applicationService.js
│   └── chatService.js

├── layouts/
│   └── DashboardLayout.jsx

├── routes/
│   └── AppRoutes.jsx

├── styles/
│   └── global.css

├── App.jsx
└── main.jsx

You are a senior React architect and frontend engineer.

Build the complete frontend for CodeMatch.

IMPORTANT:

This is NOT the final production UI.

This frontend is for:

1. Testing the complete backend.
2. Demonstrating the MVP.
3. Providing a clean architecture that can later be handed to a frontend developer.

The frontend should be:

- Minimal
- Professional
- Responsive
- Easy to maintain
- Component based
- Mobile friendly
- Clean code
- React best practices

====================================================

PROJECT

Name:
CodeMatch

Description:

CodeMatch helps students find:

- Coding partners
- Project teammates
- Hackathon teammates
- Startup co-founders

Think:

LinkedIn + GitHub + Student Matrimony

====================================================

TECH STACK

React 19
Vite
React Router DOM
Axios
Context API
Socket.IO Client

Use JavaScript only.

DO NOT use TypeScript.

====================================================

BACKEND URL

Development:

http://localhost:5000/api

Socket:

http://localhost:5000

====================================================

PROJECT STRUCTURE

src/

├── api/
│   └── axios.js
│
├── context/
│   ├── AuthContext.jsx
│   └── SocketContext.jsx
│
├── layouts/
│   └── DashboardLayout.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Loading.jsx
│   ├── ProtectedRoute.jsx
│   ├── MatchCard.jsx
│   ├── TeamRequestCard.jsx
│   ├── ApplicationCard.jsx
│   ├── ConversationList.jsx
│   └── MessageBubble.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Skills.jsx
│   ├── Interests.jsx
│   ├── Matches.jsx
│   ├── TeamRequests.jsx
│   ├── Applications.jsx
│   └── Chat.jsx
│
├── services/
│   ├── authService.js
│   ├── userService.js
│   ├── skillService.js
│   ├── interestService.js
│   ├── matchService.js
│   ├── teamRequestService.js
│   ├── applicationService.js
│   └── chatService.js
│
├── routes/
│   └── AppRoutes.jsx
│
├── styles/
│   ├── global.css
│   ├── dashboard.css
│   └── chat.css
│
├── App.jsx
│
└── main.jsx

====================================================

AUTHENTICATION

Pages:

Register
Login

API:

POST /auth/register

POST /auth/login

Requirements:

Store JWT token in localStorage.

Persist login.

Logout functionality.

Protected routes.

Redirect unauthenticated users.

====================================================

DASHBOARD

Display cards:

Matches
Skills
Interests
Team Requests
Applications
Messages

Simple overview page.

====================================================

PROFILE PAGE

Show:

Name
Email
Bio
Github URL
LinkedIn URL

Education Type:

SCHOOL
COLLEGE
EMPLOYED
SELF_LEARNER

Support all profile fields from backend.

Allow editing.

API:

GET /users/me

PATCH /users/me

====================================================

SKILLS PAGE

Features:

View skills

Add skill

Display user skills

APIs:

GET /skills

POST /skills/user

GET /skills/user

====================================================

INTERESTS PAGE

Features:

View interests

Add interests

Display user interests

APIs:

GET /interests

POST /interests/user

GET /interests/user

====================================================

MATCHES PAGE

API:

GET /matches

Display:

Name
Bio
Compatibility Score

Buttons:

View Profile

Start Chat

====================================================

TEAM REQUEST PAGE

Features:

Create team request

View all team requests

Apply

APIs:

POST /team-requests

GET /team-requests

====================================================

APPLICATION PAGE

Features:

View my applications

View applicants

Accept application

Reject application

APIs:

POST /applications

GET /applications/my

GET /applications/team/:id

PATCH /applications/:id

====================================================

CHAT PAGE

Features:

View conversations

View messages

Send message

Create conversation

APIs:

GET /chat/conversation

POST /chat/conversation

GET /chat/message/:id

POST /chat/message/:id

====================================================

SOCKET.IO

Connect:

const socket = io("http://localhost:5000");

Events:

join_conversation

send_message

receive_message

Requirements:

Realtime message updates.

Auto scroll to latest message.

====================================================

LAYOUT

Desktop:

----------------------------------

Sidebar

Dashboard

Profile

Skills

Interests

Matches

Team Requests

Applications

Chat

Logout

----------------------------------

Mobile:

Hamburger menu

Responsive navigation

====================================================

DESIGN SYSTEM

Colors:

Primary:
#2563EB

Success:
#22C55E

Danger:
#EF4444

Background:
#F8FAFC

Text:
#111827

Cards:

border-radius: 12px

Subtle shadow

Clean spacing

====================================================

UI REQUIREMENTS

No fancy animations.

No premium UI.

No dark mode.

No notifications.

No video calls.

No voice calls.

Focus on:

Functionality
Testing backend
Demo readiness

====================================================

DELIVERABLES

Generate:

1. Complete folder structure.

2. All React pages.

3. All components.

4. All services.

5. Auth Context.

6. Socket Context.

7. Routing.

8. Protected Routes.

9. API Integration.

10. Socket.IO Integration.

11. CSS files.

12. Setup instructions.

13. Run instructions.

14. Environment configuration.

Generate production-quality code.

Provide code file by file.

Do not skip any file.