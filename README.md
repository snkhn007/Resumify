<div align="center">

# Resumify

**AI-powered resume builder with ATS scoring, role-based access control, and a live preview editor — built for real job seekers.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://resumify-backend-oqq4.onrender.com/user/)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/snkhn007/Resumify)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## What is Resumify?

Resumify is a full-stack resume platform where job seekers can build, preview, and download professional resumes using company-specific templates, then evaluate them against a target job role using an AI-powered ATS (Applicant Tracking System) scorer. Recruiters and coaches can browse candidate resumes, filter by skill or template, and shortlist them — all through a gated, admin-verified access system.

The project is live and deployed on Render: **[resumify-backend-oqq4.onrender.com/user/](https://resumify-backend-oqq4.onrender.com/user/)**

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Core Features](#core-features)
- [Authentication & RBAC](#authentication--rbac)
- [ATS Scoring Engine](#ats-scoring-engine)
- [Resume Builder](#resume-builder)
- [Recruiter Portal](#recruiter-portal)
- [Admin Dashboard](#admin-dashboard)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | EJS (server-side templating), Vanilla JS, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (stored in `httpOnly` cookies) |
| **AI / LLM** | Groq API (`llama-3.3-70b-versatile`) |
| **Validation** | `express-validator` (server) + custom JS (client) |
| **Security** | bcrypt password hashing, `sameSite: strict` cookies, role guards |
| **Deployment** | Render (backend + static assets) |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│   EJS Views + Vanilla JS (dashboard, atsChecker, etc.)   │
└────────────────────────┬─────────────────────────────────┘
                         │  HTTP (cookie-based JWT)
┌────────────────────────▼─────────────────────────────────┐
│                   Express App (app.js)                    │
│                                                           │
│  /api/auth      → authRoutes.js    (signup, login, me)    │
│  /api/resumes   → resumeRoutes.js  (CRUD)                 │
│  /api/ats       → atsRoutes.js     (Groq AI analysis)     │
│  /api/recruiter → recruiterRoutes.js (browse, shortlist)  │
│  /api/admin     → admin routes     (approve/reject users) │
│                                                           │
│  Middleware: requireAuth | requireAuthPage | softAuth      │
└────────────┬───────────────────────────────┬─────────────┘
             │                               │
┌────────────▼──────────┐       ┌────────────▼────────────┐
│   MongoDB (Mongoose)  │       │   Groq API (LLM)        │
│   User model          │       │   llama-3.3-70b         │
│   Resume model        │       │   temperature: 0.3      │
└───────────────────────┘       └─────────────────────────┘
```

Authentication uses `httpOnly` cookies carrying a 7-day JWT. Three middleware layers handle access:
- `requireAuth` — blocks API routes, returns 401 JSON
- `requireAuthPage` — blocks page routes, redirects to `/user/login`
- `softAuth` — attaches user if token exists but never blocks (used on public pages)

---

## Core Features

### What's fully working right now

| Feature | Status |
|---|---|
| Resume builder with live preview | ✅ |
| 3 company-specific templates | ✅ |
| Save / edit / delete resumes from dashboard | ✅ |
| ATS score against a user-defined target role | ✅ |
| JWT auth with httpOnly cookies | ✅ |
| Role-based access (jobseeker / recruiter / coach / admin) | ✅ |
| Admin approval workflow for recruiter accounts | ✅ |
| Recruiter resume browser with filters + shortlisting | ✅ |
| Resume PDF download | ✅ |
| Dual validation (client-side JS + express-validator) | ✅ |

---

## Authentication & RBAC

### Roles

| Role | Access |
|---|---|
| `jobseeker` | Default. Immediately active. Can build and manage resumes. |
| `recruiter` | Requires admin approval before first login. Can browse and shortlist jobseeker resumes. |
| `coach` | Same approval gate as recruiter. Treated identically to recruiter in the current RBAC layer. |
| `admin` | Seeded directly in MongoDB Atlas. Can approve or reject pending recruiter/coach accounts. |

### Signup flow for restricted roles

When a user signs up as `recruiter` or `coach`, their `status` is set to `pending`. The server returns a `403` immediately and the frontend shows a pending-approval banner. The JWT is never issued until an admin approves the account. Once approved, the user can log in normally.

```js
// authRoutes.js
const assignedStatus = (assignedRole === 'recruiter' || assignedRole === 'coach')
  ? 'pending'
  : 'active';
```

The recruiter routes apply a double guard: `requireAuth` (JWT check) followed by `requireRecruiter` (role check + live DB status check). This means a recruiter whose account is revoked after login will be blocked on their next request — the token alone is not sufficient.

```js
// recruiterRoutes.js
const requireRecruiter = async (req, res, next) => {
  if (!['recruiter', 'coach', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Recruiter access required' });
  }
  const user = await User.findById(req.user._id).select('status');
  if (!user || user.status !== 'active') {
    return res.status(403).json({ message: 'Your account is pending approval.' });
  }
  next();
};
```

---

## ATS Scoring Engine

The ATS checker (`/api/ats/analyze`) extracts the raw text content from the rendered resume preview in the DOM, then sends it to Groq's `llama-3.3-70b-versatile` model with a structured prompt that enforces strict JSON output.

### Scoring rubric (100 points total)

| Category | Max Points |
|---|---|
| Keyword Relevance | 25 |
| Experience Quality | 20 |
| Skills Strength | 15 |
| Achievements Impact | 15 |
| Formatting | 10 |
| Completeness | 10 |
| Clarity | 5 |

### Response shape

```json
{
  "ats_score": 74,
  "breakdown": {
    "keyword_relevance": 18,
    "skills_strength": 11,
    "experience_quality": 16,
    "achievements_impact": 10,
    "formatting": 8,
    "completeness": 8,
    "clarity": 3
  },
  "missing_keywords": ["Docker", "CI/CD", "REST APIs"],
  "improvements": ["Quantify achievements with metrics", "Add a projects section"],
  "summary": "Strong experience section but lacks role-specific keywords."
}
```

The client (`atsChecker.js`) collects text from the live resume preview by cloning the DOM node, stripping action buttons, and reading `innerText`. This means the score always reflects what the candidate has actually filled in — no stale data.

Temperature is set to `0.3` to minimize hallucinated scores while keeping some variance in suggestions. The route also strips markdown fences from the model response before parsing, since instruction-tuned models sometimes wrap JSON in triple backticks despite being told not to.

---

## Resume Builder

Resumify offers three templates, each targeting a specific company's known resume style:

- **Classic** — General purpose, clean single-column layout
- **Google SWE** — Structured to match Google's preferred resume format
- **Amazon SWE** — Structured with STAR-method emphasis for Amazon's bar-raiser culture

Each template renders a **live preview** as the user types. On save, the entire resume payload is sent to `POST /api/resumes`. If a `resumeId` query parameter is present in the URL (set when clicking "Edit" from the dashboard), the route updates the existing document instead of creating a new one.

```js
// resumeRoutes.js — upsert logic
if (resumeId) {
  const existing = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  Object.assign(existing, { ...fields });
  await existing.save();
  return res.status(200).json({ message: 'Resume updated', resume: existing });
}
// else create new
```

The `userId` ownership check on every find query means a user cannot read or modify another user's resume even if they know the ObjectId.

---

## Recruiter Portal

Recruiters get a browseable directory of all active jobseeker resumes. The API supports:

- **Full-text search** across `fullName`, `tagline`, `summary`, and `skills`
- **Skill filter** — regex match against the comma-separated skills string
- **Template filter** — case-insensitive, so "classic" and "Classic" both work
- **Pagination** — default 9 per page, max 50

Shortlisting uses MongoDB's atomic `$addToSet` / `$pull` operators instead of `.save()`, which avoids Mongoose silently dropping fields not declared in the schema.

```js
// Toggle shortlist atomically
const alreadySaved = recruiter.shortlist.some(id => id.toString() === resumeId);
if (alreadySaved) {
  await User.findByIdAndUpdate(recruiterId, { $pull: { shortlist: resumeId } }, { new: true });
} else {
  await User.findByIdAndUpdate(recruiterId, { $addToSet: { shortlist: resumeId } }, { new: true });
}
```

---

## Admin Dashboard

The admin account is seeded directly in MongoDB Atlas — no signup flow. The dashboard fetches all non-admin users and separates them into three tabs: Pending, All, Rejected.

Approve and reject actions hit `PATCH /api/admin/approve/:id` and `PATCH /api/admin/reject/:id`. After each action the frontend updates its local `allUsers` array in memory and re-renders without a full page reload.

A confirmation modal prevents accidental approvals or rejections.

---

## Project Structure

```
Resumify/
├── app.js                  # Express entry point, route mounting
├── config/
│   └── db.js               # Mongoose connection
├── middleware/
│   ├── authMiddleware.js   # requireAuth, requireAuthPage, softAuth
│   └── backendValidation.js# express-validator rule sets
├── model/
│   ├── user.js             # User schema (bcrypt pre-save hook, comparePassword)
│   └── resume.js           # Resume schema (experience[], education[], projects[])
├── routes/
│   ├── authRoutes.js       # /api/auth — signup, login, logout, me
│   ├── resumeRoutes.js     # /api/resumes — CRUD
│   ├── atsRoutes.js        # /api/ats/analyze — Groq integration
│   ├── recruiterRoutes.js  # /api/recruiter — browse, shortlist
│   └── adminRoutes.js      # /api/admin — approve, reject, list users
├── views/                  # EJS templates
│   ├── dashboard.ejs
│   ├── template01.ejs      # Classic
│   ├── template02.ejs      # Google SWE
│   ├── template03.ejs      # Amazon SWE
│   ├── recruiter/
│   └── admin/
└── public/
    ├── js/
    │   ├── dashboard.js
    │   ├── atsChecker.js
    │   ├── navbar.js
    │   └── signupValidation.js
    └── css/
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login, sets JWT cookie |
| POST | `/logout` | No | Clears JWT cookie |
| GET | `/me` | Yes | Returns current user from DB |

### Resumes — `/api/resumes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Create or update a resume |
| GET | `/` | Yes | List all resumes for current user |
| GET | `/:id` | Yes | Fetch a single resume |
| DELETE | `/:id` | Yes | Delete a resume |

### ATS — `/api/ats`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/analyze` | No | Score resume text against a target role |

### Recruiter — `/api/recruiter`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/resumes` | Recruiter | Browse jobseeker resumes (filterable) |
| GET | `/resumes/:id` | Recruiter | Full resume detail |
| PATCH | `/shortlist/:resumeId` | Recruiter | Toggle shortlist |
| GET | `/shortlist` | Recruiter | Get all shortlisted resumes |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all non-admin users |
| PATCH | `/approve/:id` | Admin | Set user status to `active` |
| PATCH | `/reject/:id` | Admin | Set user status to `rejected` |

---

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
PORT=3000
```

> **Note:** The app will exit immediately at startup if `JWT_SECRET` is not set. This is intentional — running without a secret would silently accept any token.

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/snkhn007/Resumify.git
cd Resumify

# Install dependencies
npm install

# Add your environment variables
cp .env.example .env
# Edit .env with your values

# Start the dev server
node app.js
# or with nodemon
npx nodemon app.js
```

Visit `http://localhost:3000/user/` in your browser.

To create an admin account, insert a user document directly in MongoDB Atlas with `role: "admin"` and `status: "active"`. The password should be a bcrypt hash (salt rounds: 10).

---

<div align="center">

Built with Node.js, MongoDB, and Groq AI · Deployed on Render

</div>
