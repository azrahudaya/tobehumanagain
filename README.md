# To Be Human Again

An empathy-focused story game built as a full-stack web app.

This project started as a prototype and grew into a playable React + Express app with:
- branching narrative scenes
- mission progression
- save/continue flow
- OTP-based signup
- admin CRUD + basic analytics

The vibe is visual novel style, mobile-first, and easy to keep expanding.

## What You Can Do Right Now

### Player side
- Start a new run or continue saved progress
- Play through branching scenes and choices
- Get educational feedback after each choice
- See mission status (auto-tracked by the system)
- Open a reflection journal

### Admin side
- Manage chapters, scenes, choices, and missions
- Configure branching (`choice -> nextSceneId`)
- Set scoring + feedback per choice
- Publish/unpublish content
- View simple analytics (players, most-picked scenes, score distribution)

### Auth + security
- Sign up with email OTP
- Login with username/email + password
- Access token + refresh token flow
- OTP and login rate limiting (basic anti-bruteforce)

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- SQLite (dev)

### Auth & mail
- JWT (access token)
- HTTP-only refresh cookie
- Nodemailer (Gmail SMTP or any SMTP provider)

## Project Structure

```txt
.
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ layouts/
│  │  └─ pages/
│  └─ public/
├─ backend/
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  ├─ game/
│  │  │  └─ admin/
│  │  ├─ middleware/
│  │  └─ lib/
│  └─ prisma/
│     ├─ schema.prisma
│     ├─ setup-db.ts
│     └─ seed.ts
├─ shared/types/
└─ backup-old/legacy-prototype/
```

## Quick Start (Local Dev)

### 1) Install dependencies

```bash
npm install
```

### 2) Setup backend env

Create your local env from the example:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

### 3) Configure SMTP (optional but recommended)

If SMTP is configured, OTP is sent to real email.
If not, signup still works in dev mode using `debugOtp` response.

Important keys:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### 4) Initialize database + seed data

```bash
npm run db:setup
```

### 5) Run frontend + backend together

```bash
npm run dev
```

App URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Default Dev Accounts

### Admin
- Username: `admin`
- Email: `admin@tobehumanagain.dev`
- Password: `Admin123!`

### Demo Player
- Username: `player`
- Email: `player@tobehumanagain.dev`
- Password: `Player123!`

## Environment Variables (Backend)

Check `backend/.env.example` for the full list.

Core groups:
- App/config: `PORT`, `CLIENT_ORIGIN`, `DATABASE_URL`
- JWT/session: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS`
- OTP controls: `OTP_TTL_MINUTES`, `OTP_RESEND_COOLDOWN_SECONDS`, `OTP_MAX_REQUESTS_WINDOW`, `OTP_WINDOW_MINUTES`, `OTP_MAX_ATTEMPTS`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Useful Scripts

From repo root:

- `npm run dev` → run backend + frontend
- `npm run dev:backend` → backend only
- `npm run dev:frontend` → frontend only
- `npm run build` → build both apps
- `npm run db:setup` → generate client + setup DB + seed
- `npm run seed` → reseed database

## Notes

- Story and mission content live in the database, not hardcoded in the UI.
- Mission completion is auto-evaluated by the system.
- The gameplay core flow is working end-to-end:
  - New Game -> Story -> Choice -> Feedback -> Next Scene -> Save -> Continue

If you want to deploy this next, the easiest path is:
1) switch SQLite to Postgres
2) move secrets to proper env manager
3) run backend + frontend behind a single domain with secure cookies enabled
