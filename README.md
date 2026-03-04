# To Be Human Again - Full Web App

Full-stack web game (React + Express) untuk visual-novel edukasi empati dengan branching story, mission system, save/continue, dashboard skor, dan admin panel CRUD + analytics.

## Stack yang dipilih (dan alasannya)

- Frontend: React + TypeScript + Vite + Tailwind CSS
  - cepat untuk iterasi UI mobile-first, komponen reusable, dan routing jelas.
- Backend: Node.js + Express + TypeScript
  - ringan, mudah dipisah per modul (`auth`, `game`, `admin`), cocok untuk API game state.
- Database: SQLite + Prisma Client
  - setup lokal cepat tanpa service tambahan, tetap punya typed query via Prisma.
- Auth: Sign up (OTP email), login (username/email + password), JWT access token + refresh token cookie
  - aman untuk sesi user, mendukung role USER/ADMIN, plus rate limiting OTP dan login limiter.

## Fitur yang sudah diimplementasikan

### Player/Game
- Title screen: `New Game`, `Continue`, `Settings`, `Credits`
- Continue aktif jika ada progress tersimpan
- Branching narrative story (seed: 1 chapter, 8 scene, 2-3 choice per scene)
- Tiap choice memengaruhi empathy score + feedback edukatif
- Mission/level list dengan lock/unlock + reward badge/score
- Save/load progress (checkpoint scene tersimpan server-side)
- Dashboard hasil (total score, chapter summary, rekomendasi, riwayat pilihan)

### Admin
- Admin role-based access
- CRUD Chapters, Scenes, Choices, Missions
- Branching config via `choice -> nextSceneId`
- Publish/unpublish chapter/scene/choice/mission
- Analytics sederhana:
  - jumlah pemain
  - scene paling sering dipilih
  - distribusi empathy score

### Auth & Security
- Sign up pakai OTP email
- Login pakai `username/email + password` (tanpa OTP)
- OTP rate limiting + cooldown + max attempt
- Login rate limiting (anti brute force dasar)
- Password hash (`bcrypt`)
- Access token (Bearer JWT) + refresh token (HTTP-only cookie)

## Struktur proyek

```txt
.
├─ frontend/                 # React app
│  ├─ src/
│  │  ├─ components/ui/      # Button, Card, Modal, DialogBox, Input
│  │  ├─ context/            # AuthContext, GameContext
│  │  ├─ pages/              # Auth, Title, Story, Missions, Dashboard, Admin
│  │  ├─ api/                # axios client + token/refresh handler
│  │  └─ layouts/
│  └─ ...
├─ backend/                  # Express API
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ auth/            # signup OTP, login direct, refresh, me, logout
│  │  │  ├─ game/            # title-state, new/continue, choose, missions, dashboard
│  │  │  └─ admin/           # CRUD + analytics
│  │  ├─ middleware/
│  │  └─ lib/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ init.sql            # schema SQL bootstrap
│  │  ├─ setup-db.ts         # initialize sqlite from init.sql
│  │  └─ seed.ts             # seed chapter/scenes/choices/missions/users
│  └─ .env.example
├─ shared/types/
└─ backup-old/legacy-prototype/  # file prototipe lama
```

## Setup lokal (dev)

1. Install dependencies

```bash
npm install
```

2. Konfigurasi env backend

```bash
cp backend/.env.example backend/.env
```

3. (Opsional) isi kredensial Gmail SMTP untuk OTP real email

- `SMTP_USER`: email Gmail
- `SMTP_PASS`: Gmail App Password
- `SMTP_FROM`: sender display

Jika SMTP tidak diisi, OTP tetap jalan di mode dev melalui `debugOtp` response (ditampilkan di UI sign up).

4. Setup database dan seed

```bash
npm run db:setup
```

5. Jalankan frontend + backend

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Akun default (dev only)

- Admin
  - username: `admin`
  - email: `admin@tobehumanagain.dev`
  - password: `Admin123!`
- User demo
  - username: `player`
  - email: `player@tobehumanagain.dev`
  - password: `Player123!`

## Environment variables backend

Contoh tersedia di `backend/.env.example`.

- `PORT`, `CLIENT_ORIGIN`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL_MINUTES`, `REFRESH_TOKEN_TTL_DAYS`
- `OTP_TTL_MINUTES`, `OTP_RESEND_COOLDOWN_SECONDS`, `OTP_MAX_REQUESTS_WINDOW`, `OTP_WINDOW_MINUTES`, `OTP_MAX_ATTEMPTS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Catatan keputusan teknis

- Konten story/missions disimpan di DB (bukan hardcoded frontend), sehingga mudah dikembangkan lewat admin panel.
- Flow gameplay utama sudah jalan end-to-end:
  - New Game -> Story -> Choice -> Feedback -> Next Scene -> Save progress -> Continue -> Dashboard.
- Admin CRUD dibuat minimal namun operasional agar bisa langsung dipakai authoring konten.
