# HireLink – Build Plan

## Goal

Build a frontend-only recruitment platform with:

- **Candidate flow:** browse jobs → apply via multi-step form → get a unique application ID
- **Recruiter flow (protected):** login → manage jobs (CRUD) → manage candidate pipeline (drag/drop) → review candidates → schedule interviews → generate + email offer letter
- **Data persistence:** seeded mock data + localStorage

---

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- **shadcn/ui** (components)
- **Framer Motion** (animations)
- React Router
- Zustand (global store)
- React Hook Form + Zod (forms + validation)
- @dnd-kit (drag & drop)
- pdf-lib (offer letter PDF)
- date-fns (dates)

---

## Data & Persistence

- **Seed:** `public/seed.json` with `users`, `jobs`, `applications` (initially empty).
- **Hydration:** On first load, if no localStorage → fetch seed.json and save to localStorage. Else use localStorage.
- **CRUD:** Every change to jobs or applications writes to localStorage so data persists across refresh/sessions.
- **Resume:** Store metadata only (fileName, type, size, lastModified) – no base64 in localStorage.

---

## Routes

| Route                              | Purpose                                          |
| ---------------------------------- | ------------------------------------------------ |
| `/`                                | Job listings (public)                            |
| `/apply/:jobId`                    | Multi-step application wizard                    |
| `/thanks/:applicationId`           | Confirmation + application ID                    |
| `/login`                           | Recruiter login                                  |
| `/admin`                           | Pipeline board (protected)                       |
| `/admin/jobs`                      | Job CRUD (protected)                             |
| `/admin/candidates/:applicationId` | Candidate review + scheduler + offer (protected) |

---

## Auth

- Login form checks email/password against seeded `users`.
- On success: set session in store + localStorage; redirect to `/admin`.
- Route guard: if not logged in and path is `/admin*` → redirect to `/login`.

---

## Features (by step)

1. **Scaffold** – shadcn init, Framer Motion, routing skeleton
2. **Seed + store** – seed.json, Zustand, localStorage hydration
3. **Routing + auth** – routes, login page, protected admin
4. **Admin Jobs CRUD** – list, create, edit, delete jobs; persist
5. **Public Jobs List** – list jobs, “Apply” → `/apply/:jobId`
6. **Apply wizard** – 3 steps (Personal, Experience, Resume), Zod, tag input, file validation
7. **Submit + Thank You** – generate `app_xxx` ID, save application, redirect, Thank You page
8. **Pipeline board** – kanban (Applied, Reviewed, Interview Scheduled, Offer Sent), dnd-kit, persist stage on drop
9. **Candidate detail** – full profile, score 1–5, notes; persist
10. **Interview scheduling** – date/time picker, save; auto-move to “Interview Scheduled”
11. **Offer letter** – Draft Offer → PDF (pdf-lib) download; Send Email → mailto with “attach PDF”
12. **Polish** – Thank You copy, error messages, loading/empty states; README (setup, credentials, decisions)

---

## Build approach

- Build **step by step, feature by feature**: implement → test in browser → fix → next step.
- Use **shadcn/ui** for forms, cards, dialogs, toasts, tables.
- Use **Framer Motion** for step transitions, pipeline cards, modals, empty states (subtle, not heavy).

---

## Edge cases

- **Deleted job:** If a job is deleted but applications reference it, keep applications; show “Deleted job” in admin candidate view.
- **Application ID:** Generate on frontend at submit (e.g. `app_` + crypto.randomUUID().slice(0, 8)).
