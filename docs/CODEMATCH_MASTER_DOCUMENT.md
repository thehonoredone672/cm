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