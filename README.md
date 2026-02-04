# HireLink - Frontend Recruitment Platform

HireLink is a frontend-only recruitment platform built with React, Vite, and shadcn/ui. It manages the end-to-end hiring journey from candidate application to recruiter decision-making.

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Public Job Listings: `http://localhost:5173/`
   - Recruiter Login: `http://localhost:5173/login`

## 🔐 Recruiter Credentials

- **Email:** `recruiter@hirelink.com`
- **Password:** `password123`

## ✨ Features

### Candidate Flow

- **Job Listings:** Browse open roles with details like location and type.
- **Multi-Step Application:**
  - Personal Information
  - Experience & Skills (with interactive tagging)
  - Resume Upload (metadata tracking)
- **Unique Application ID:** Generated upon submission.
- **Thank You Page:** Confirmation with ID copying functionality.

### Recruiter Flow (Admin)

- **Protected Routes:** Access controlled by local session.
- **Pipeline Board:** Kanban-style board with **Drag & Drop** functionality to move candidates between stages:
  - Applied → Reviewed → Interview Scheduled → Offer Sent
- **Job Management:** Full CRUD operations for job listings.
- **Candidate Review:**
  - View full profiles and skills.
  - Rate candidates (1-5 stars) and add private notes.
  - Schedule interviews with auto-stage updates.
  - Generate mock offer letters and initiate email (mailto).

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Forms & Validation:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit
- **Utilities:** date-fns, lucide-react

## 📂 Persistence Strategy

- **Mock Backend:** `public/seed.json` provides initial data.
- **LocalStorage:** All changes (Job CRUD, applications, stage transitions) are persisted in `localStorage` to survive page refreshes.
- **File Handling:** Resume metadata is stored locally (no large base64 strings) for efficiency.

## 🎨 Design Decisions

- **Responsive Design:** Mobile-first approach using Tailwind's responsive grid.
- **Branding:** Professional Navy Blue primary color palette.
- **UX:** Smooth transitions with Framer Motion and accessible components from shadcn/ui.
- **Simplicity:** Clean, focused interfaces for both candidates and recruiters.
