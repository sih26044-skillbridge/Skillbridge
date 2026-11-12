# SkillBridge — SIH26044
**Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement**

SkillBridge connects students, colleges, and corporate recruiters. It automates skill extraction from PDF resumes using **pdf-parse**, calculates transparent candidate-to-job match scores, and provides structured applicant tracking across 5 recruitment stages.

---

## 🚀 Key Features

1. **Role-Based Portals (3 Distinct Roles):**
   - **Student:** Upload PDF resumes, automatically extract skills, manually adjust proficiencies, browse deterministic job matches (with matched vs. missing skills analysis), and track application status.
   - **Recruiter:** Post internships/jobs with required skill criteria, review candidates ranked by skill match score, inspect student skill portfolios, and update recruitment status (Applied → Under Review → Shortlisted → Selected / Rejected).
   - **Admin:** Comprehensive platform analytics (total students, recruiters, jobs, applications, resumes), status funnel breakdown, and user management.

2. **Resume Parsing & Skill Extraction:**
   - Powered by **pdf-parse** (Node.js).
   - Normalizes tech acronyms (e.g. `ML` → `Machine Learning`, `JS` → `JavaScript`, `NLP` → `Natural Language Processing`).
   - Word boundary regex prevents partial-word false positives (e.g., `Java` does not match `JavaScript`; `Git` does not match `Digital`).

3. **Deterministic Match Scoring Algorithm:**
   $$\text{Match Score} = \left(\frac{\text{Matched Required Skills}}{\text{Total Required Skills}}\right) \times 100$$
   - Clearly highlights **Matched Skills** (green) and **Missing Skills to Improve** (rose) so students know exactly how to increase their employability.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Lucide React icons.
- **Backend:** Node.js 20+, Express.js, Prisma ORM, JWT authentication (`jsonwebtoken` + `bcrypt`), CORS.
- **Parsing / NLP:** pdf-parse (Node.js), skill dictionary with 70+ skills and keyword matching.
- **Database:** PostgreSQL (via Prisma ORM).

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (or cloud connection string)

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy env template and configure
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string

# Push Prisma schema to PostgreSQL (creates all tables)
npm run db:push

# (Optional) Seed the database with canonical skills, demo users, and realistic jobs
npm run seed

# Start the Express development server
npm run dev
```

The backend API will run at: `http://localhost:8000/api/`
Health check: `http://localhost:8000/api/health`

---

### 2. Frontend Setup & Run

Open a second terminal in the project root:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already)
npm install

# Start the Vite development server
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 👥 Demo Accounts (Pre-configured for SIH Demonstration)

Use the 1-click demo filler buttons on the Login page (`/login`) or enter manually:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student (Data/ML)** | `arjun_student` | `student123` | Skills: Python, SQL, Pandas, NumPy, Git |
| **Student (Full Stack)** | `priya_student` | `student123` | Skills: React, JavaScript, HTML, CSS, Django |
| **Recruiter (TechCorp)** | `techcorp_recruiter` | `recruiter123` | Enterprise postings (Full Stack, DevOps) |
| **Recruiter (AI Labs)** | `aidynamics_recruiter` | `recruiter123` | AI & Analytics postings |
| **Platform Admin** | `admin` | `admin123` | Control center & telemetry dashboard |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register student or recruiter account
- `POST /api/auth/login` — Login and receive JWT access & refresh tokens
- `POST /api/auth/logout` — Invalidate user session
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Students
- `GET /api/students/profile` — Fetch student academic profile & skills
- `PUT /api/students/profile` — Update student profile details
- `POST /api/students/upload-resume` — Upload PDF resume & auto-extract skills with pdf-parse
- `GET /api/students/skills` — List student skills
- `POST /api/students/skills` — Add a manual skill
- `DELETE /api/students/skills/<id>` — Remove skill

### Recommendations & Jobs
- `GET /api/recommendations` — Ranked job recommendations with matched & missing skills breakdown
- `GET /api/jobs` — Search & filter active jobs (by search query, location, job type, skill)
- `GET /api/jobs/<id>` — Job details with candidate skill match analysis
- `POST /api/jobs` — Post a new job (Recruiters only)
- `DELETE /api/jobs/<id>` — Delete a job (Recruiter owner only)

### Applications
- `POST /api/applications` — Submit application (Student only, prevents duplicates)
- `GET /api/applications/my` — View student's submitted applications & statuses
- `GET /api/jobs/<id>/applications` — View all applicants for a job (Recruiter only)
- `PATCH /api/applications/<id>/status` — Update application stage (`Applied`, `Under Review`, `Shortlisted`, `Rejected`, `Selected`)

### Admin
- `GET /api/admin/dashboard` — System telemetry and status breakdown
- `GET /api/admin/users` — Platform user list with role filters
- `PATCH /api/admin/jobs/<id>/toggle-active` — Toggle job active/inactive

### Utility
- `GET /api/skills` — List all canonical skills in the catalog
- `GET /api/health` — API health check
