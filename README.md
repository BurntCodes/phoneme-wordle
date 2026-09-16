# Phoneme Word Games

A builder for phoneme-based Wordle and Word Search classroom activities, aimed at Speech Pathology students and teachers. Teachers manage word lists and activity settings, which drive both the live preview and a "Generate HTML" button that produces a standalone HTML file playable in any browser — no server, no dependencies, at the point it's actually played.

Built for CSE3CWA. Assessment 1 delivered the frontend-only builder; Assessment 2 added the backend, database, and Docker layer — word lists and activity settings are now stored and managed through a real API instead of being hardcoded into the frontend.

## Getting started

```bash
npm install
cp .env.example .env   # first time only
npm run db:up          # starts Postgres via Docker Compose
npm run db:migrate      # applies the Prisma schema
npm run db:seed         # populates it with the current word/phoneme data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whichever port the terminal prints, if 3000 is already in use).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · PostgreSQL via Prisma 7 · Docker

## Project structure

- `src/app/` — routes: Home, About, Wordle, Word Search, Manage, Settings, plus the `api/` route handlers below
- `src/components/` — layout (Header/NavBar/Footer), theme toggle, thin React "host" wrappers for each game, and the `manage/` content-management UI
- `src/lib/api/` — the CRUD API's shared error handling (`errors.ts`) and Zod validation schemas (`validation.ts`), plus the client-side fetch layer (`client.ts`) the game components use
- `src/lib/` — puzzle-generation and export logic, and `phonemes.ts`/`wordSearch.ts`'s hardcoded corpus, which is now only `prisma/seed.ts`'s source of truth (see below)
- `public/engines/` — the actual Wordle and Word Search game engines: plain JavaScript, no imports, no build step
- `prisma/` — the database schema, migrations, and seed script

### Why the games live in `public/engines/` instead of as React components

The "Generate HTML" button has to produce a single, fully standalone `.html` file — no React runtime, no bundler, works offline by double-clicking it. Rather than maintaining two implementations of each game (one in JSX for the live preview, one hand-ported to vanilla JS for the export — which could silently drift apart), each game's actual logic and rendering lives in exactly one place: a plain-JS "engine" in `public/engines/`. The live app loads and mounts that same file via a thin React host component (`useRef` + `useEffect`), and the export function serializes the exact options object that was passed to `mount()` — the generated file's data can't drift from what was on screen, by construction. The host components source that data from the API (see below) rather than hardcoded constants; the engines themselves don't know or care where it came from.

## Database and API

Word lists, their words' ordered phoneme sequences, the fixed 43-symbol phoneme reference inventory, and activity configurations (Wordle/Word Search settings — difficulty, max guesses, grid size, hints) are modeled in `prisma/schema.prisma` and backed by PostgreSQL. See the schema file and `prisma/seed.ts` for the full shape.

CRUD routes, all under `src/app/api/`:

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/health` | GET | Real DB connectivity check, not a static 200 |
| `/api/phonemes` | GET | Read-only — the phoneme inventory is fixed reference data |
| `/api/word-lists` | GET, POST | |
| `/api/word-lists/[id]` | GET, PATCH, DELETE | Delete is rejected (409) if an Activity still references the list |
| `/api/word-lists/[id]/words` | POST | Add a word; every phoneme is checked against the reference inventory |
| `/api/words/[id]` | PATCH, DELETE | |
| `/api/activities` | GET (`?type=WORDLE\|WORD_SEARCH`), POST | Create validates Wordle vs. Word Search's different required settings |
| `/api/activities/[id]` | GET, PATCH, DELETE | |

The Wordle and Word Search pages each show a selector over the real activities of that type returned by the API — adding an activity makes it available to play with no code change.

Teachers manage word lists, words, and activities through the **Manage** page (in the nav menu) — create/rename/delete word lists, add/edit/delete words (with a click-to-build phoneme picker rather than free text, since IPA symbols aren't typeable on a normal keyboard), and create/edit/delete activities. This drives the same API above; it's not a separate data path.

## Database (local dev)

```bash
npm run db:up      # starts Postgres via Docker Compose
npm run db:migrate  # applies the Prisma schema
npm run db:seed     # populates it with the current word/phoneme data
npm run db:studio   # optional: browse the database at http://localhost:5555
```

## Running with Docker

`docker-compose.yml` has an `app` service (the Next.js app itself, built from the root `Dockerfile` using `output: "standalone"` for a minimal runtime image) alongside `db`.

```bash
cp .env.example .env   # first time only
docker compose up -d --build
npm run db:migrate      # migrations run against the container from the host, same as local dev
npm run db:seed
```

The app is then reachable at [http://localhost:3000](http://localhost:3000) (override with `APP_PORT` in `.env` if that port is taken, the same way `POSTGRES_PORT` overrides Postgres's).

## Building

```bash
npm run build
npm run lint
```
