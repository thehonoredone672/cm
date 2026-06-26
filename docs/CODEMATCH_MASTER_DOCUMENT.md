# CodeMatch Master Document

## Project Name

CodeMatch

## Vision

CodeMatch is a student collaboration platform that helps students find coding partners, study buddies, project teammates, and hackathon teams based on skills, interests, goals, and coding ability.

## Problem Statement

Students struggle to find reliable teammates for:

* Coding projects
* Hackathons
* Study groups
* Open-source contributions

Current platforms such as LinkedIn, GitHub, Discord, and WhatsApp do not provide compatibility-based student matching.

## Solution

CodeMatch matches students using:

* Skills
* Interests
* Academic background
* Career goals

and provides collaboration tools such as:

* Team Requests
* Applications
* Realtime Chat

## MVP Features

### Authentication

* Register
* Login
* JWT Authentication

### Student Profiles

* Personal Information
* Skills
* Interests
* GitHub Profile
* LinkedIn Profile

### Compatibility Matching

Students receive suggested collaborators.

### Team Requests

Students can recruit teammates.

### Applications

Students can apply to join teams.

### Realtime Chat

Students can communicate after connecting.

## User Roles

### Student

Can:

* Register
* Login
* Create Profile
* Edit Profile
* Add Skills
* Add Interests
* Create Team Requests
* Apply to Teams
* Chat

### Admin

Can:

* Manage Users
* Manage Reports

## Technology Stack

### Frontend

* React
* JavaScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query

### Backend

* Node.js
* Express.js
* JavaScript

### Database

* PostgreSQL

### ORM

* Prisma

### Authentication

* JWT

### Realtime

* Socket.IO

### Storage

* Cloudinary

## Development Database

Local PostgreSQL

## Production Database

Neon PostgreSQL

## Backend Deployment

Render

## Frontend Deployment

Vercel

## Future Roadmap

### Version 2

* Recruiter Portal
* Placement Features
* AI Matching Improvements
* Judge0 Integration

### Version 3

* Coding Assessments
* Resume Builder
* AI Career Assistant

## Current Status

Phase 1 Completed

Phase 2 Completed

Phase 3 Restarted using:

Node.js + Express + JavaScript + Prisma + PostgreSQL

## Supported User Categories

### School Students

Can create profiles using:

- School Name
- Standard

### College Students

Can create profiles using:

- College
- Department
- Academic Year

### Working Professionals

Can create profiles using:

- Company
- Position

### Self Learners

Can create profiles using:

- Profession

## User Profile System

Each user belongs to one of:

- School Student
- College Student
- Working Professional
- Self Learner

Profiles contain:

- Academic Information
- Professional Information
- Bio
- GitHub
- LinkedIn

## Skills System

A skill represents a technical capability.

Examples:

- React
- Node.js
- PostgreSQL
- Python

Users can attach multiple skills to their profile.

## Interests System

An interest represents a user's area of collaboration.

Examples:

- Web Development
- Machine Learning
- Hackathons
- Open Source

Users can attach multiple interests to their profile.

## Matching Engine V2

CodeMatch uses a weighted Jaccard Similarity algorithm.

Purpose:

Measure how similar two users are based on their skills and interests.

Formula:

Skill Similarity =
Shared Skills / Total Unique Skills

Interest Similarity =
Shared Interests / Total Unique Interests

Final Score:

(Skill Similarity × 70)
+
(Interest Similarity × 30)

Reasoning:

Skills are more important than interests when forming project teams.

Weights:

* Skills = 70%
* Interests = 30%

Advantages:

* Prevents inflated scores
* Produces realistic compatibility values
* Scales well for future recommendation systems

### Team Request System

Purpose:

Allow students to create project, startup, study, or hackathon opportunities.

Examples:

* Looking for React Developer
* Need Backend Developer for Startup MVP
* Seeking Hackathon Team Members

Workflow:

User
↓
Creates Team Request
↓
Other Users View Request
↓
Apply
↓
Creator Accepts
↓
Team Formation

### Application System

Purpose:

Allow users to apply to join a Team Request.

Workflow:

Team Request
↓
Application Created
↓
Request Owner Reviews
↓
Accept / Reject

Statuses:

* PENDING
* ACCEPTED
* REJECTED

### Application Status

ApplicationStatus Enum

Values:

* PENDING
* ACCEPTED
* REJECTED

Purpose:

Prevent invalid application states and enforce workflow consistency.

### Team Formation Workflow

User A
Creates Team Request

↓

User B
Applies

↓

Application Created

↓

Team Owner Reviews

↓

Accept / Reject

↓

Team Formation

### Error Handling Architecture

Request
↓
Route
↓
Controller
↓
Service
↓
Database

If Error Occurs

↓

Global Error Middleware

Returns Standard Response

{
success: false,
message: "Error Message"
}

# Chat System Architecture

Purpose:

Allow matched users and team members to communicate in real time.

---

User
|
▼
ConversationParticipant
|
▼
Conversation
|
▼
Messages

---

Database Models

Conversation

Stores chat rooms.

ConversationParticipant

Stores which users belong to a conversation.

Message

Stores chat messages.

---

API Flow

Create Conversation
↓
Join Participants
↓
Send Message
↓
Store Message
↓
Retrieve Chat History

---

Security Rules

Only participants can:

* View conversations
* View messages
* Send messages

Non-participants receive:

{
"success": false,
"message": "Not authorized"
}

---

Future Upgrades

Phase 2

* Realtime messaging (Socket.IO)
* Online status
* Typing indicators
* Read receipts

Phase 3

* Team group chats
* File sharing
* Voice messages
* Notifications

### Realtime Messaging Architecture

Client
  ↓
Socket.IO
  ↓
Node.js Server
  ↓
Socket Rooms
  ↓
Connected Clients

Events:

connection

join_conversation

send_message

receive_message

disconnect

### Realtime Chat Flow

User A
↓
Send Message

↓

REST API

↓

PostgreSQL

↓

Socket.IO Event

↓

User B Receives Instantly

Benefits:

* No page refresh
* Live messaging
* Scalable architecture

# MVP Completion Status

Backend Features

Authentication             Completed
Profiles                   Completed
Skills                     Completed
Interests                  Completed
Matching Engine            Completed
Team Requests              Completed
Applications               Completed
Chat APIs                  Completed
Realtime Foundation        Completed

Next Layer

Frontend Development
Deployment
User Testing
