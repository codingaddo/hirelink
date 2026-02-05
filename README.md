# HireLink

A frontend-only recruitment platform for the full hiring journey: candidates browse jobs and apply via a multi-step form; recruiters manage jobs, move candidates through pipeline stages, review profiles, schedule interviews, and send offer letters. Built for the Digicoast frontend assessment.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run build`   | Production build (TypeScript + Vite) |
| `npm run preview` | Preview production build             |
| `npm run lint`    | Run ESLint                           |

---

## Recruiter login

Admin routes are protected. Use these credentials (from seed data):

| Field        | Value                    |
| ------------ | ------------------------ |
| **Email**    | `recruiter@hirelink.com` |
| **Password** | `password123`            |

Logged-in user in seed: **Michael Addo**.

---

## Application routes

### Public

| Path                     | Description                             |
| ------------------------ | --------------------------------------- |
| `/`                      | Job listings with search and pagination |
| `/apply/:jobId`          | Multi-step application wizard           |
| `/thanks/:applicationId` | Confirmation page with application ID   |
| `/login`                 | Recruiter login                         |

### Admin (requires login)

| Path                               | Description                                |
| ---------------------------------- | ------------------------------------------ |
| `/admin`                           | Candidate pipeline (board or table view)   |
| `/admin/jobs`                      | Job CRUD                                   |
| `/admin/candidates/:applicationId` | Candidate detail, review, interview, offer |
| `/admin/profile`                   | Recruiter profile                          |

---

## Features

### Candidate flow

- **Job list** – Browse open roles; search by title/location; pagination (e.g. 6 per page); “Showing X of Y jobs”.
- **Apply** – Three steps with validation (React Hook Form + Zod):
  1. Personal info (name, email, phone)
  2. Experience & skills (years, searchable multi-select skills, optional portfolio URL)
  3. Resume upload (PDF/DOC/DOCX, size limit; only metadata stored)
- **Submit** – Unique application ID (e.g. `app_...`), then redirect to thank-you page.
- **Thank you** – Confirmation and copyable application ID.

### Recruiter flow

- **Auth** – Email/password checked against seed users; session stored in `localStorage`. Protected routes redirect to `/login` when not logged in.
- **Pipeline** – Two views (state kept when navigating away):
  - **Table (default)** – Sortable list (candidate, job, stage, applied date, score, view). Filter by stage. Stage is read-only; change stage on the board or in candidate detail.
  - **Board** – Kanban columns: Applied → Reviewed → Interview Scheduled → Offer Sent. Drag and drop to move candidates.
- **Stage rules** – Moving _forward_ is gated: e.g. “Reviewed” requires score or notes; “Interview Scheduled” requires an interview date; “Offer Sent” requires an offer letter. If a drop is invalid, the app navigates to that candidate’s detail page so the recruiter can complete the step.
- **Jobs** – Full CRUD for job listings (title, location, type, description). Deleted jobs leave applications intact; candidate view shows “Deleted job” when the job is missing.
- **Candidate detail** – Full profile, skills, experience, resume metadata. Recruiter can:
  - Set score (1–5) and notes (saved immediately).
  - Schedule interview (shadcn date picker); moving to “Interview Scheduled” when saved.
  - Open “View resume” (preview dialog; file is metadata-only in this app).
  - Draft offer and “Generate & Email offer” (mailto with subject/body; no real email backend).
- **Profile** – Recruiter profile page (name, email) and logout. Header uses a profile dropdown (Dashboard when on public routes, Profile, Settings, Log out).

---

## Tech stack

| Area               | Choice                                       |
| ------------------ | -------------------------------------------- |
| Framework          | React 19, Vite 7                             |
| Language           | TypeScript 5.9                               |
| Styling            | Tailwind CSS 4, shadcn/ui (Radix primitives) |
| State              | Zustand (with `localStorage` persistence)    |
| Routing            | React Router 7                               |
| Forms & validation | React Hook Form, Zod, @hookform/resolvers    |
| Drag and drop      | @dnd-kit (core, sortable, utilities)         |
| Animations         | Framer Motion                                |
| Dates              | date-fns                                     |
| Icons              | lucide-react                                 |
| PDF (offer)        | pdf-lib                                      |

---

## Data and persistence

- **Seed** – `public/seed.json` provides initial `users`, `jobs`, and `applications`. On first load, if nothing is in `localStorage`, the app loads this seed and writes it to `localStorage`.
- **Runtime** – All changes (jobs, applications, stage, score, notes, interview date, offer letter, session) are stored in `localStorage` so they persist across reloads.
- **Resume** – Only metadata (fileName, type, size, lastModified) is stored; file contents are not kept (no base64 in storage).

---

## Assumptions and notes

- **Auth** – Client-side only. Credentials are checked against in-memory/seed data. Suitable for a frontend assessment; not for production without a real backend.
- **Email** – “Send offer” uses a `mailto:` link (subject/body pre-filled). The recruiter attaches the downloaded PDF manually. No server-side email.
- **Resume** – No upload to a server; “View resume” shows metadata and a placeholder preview.
- **Offer PDF** – Generated in the browser with pdf-lib and downloaded; no server-side generation.

---

## Possible future improvements

- Backend API for auth, jobs, applications, and file storage.
- Real resume upload and viewing (e.g. signed URL or embed).
- Email service for sending offers with attachments.
- Optional: persist pipeline view (board/table) in `localStorage` across sessions (currently session-only).

---

## License and attribution

Built for the Digicoast frontend assessment. © 2026 HireLink.
