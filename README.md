# Phoneme Word Games

A builder for phoneme-based Wordle and Word Search classroom activities, aimed at Speech Pathology students and teachers. Teachers manage word lists and activity settings, which drive both the live preview and a "Generate HTML" button that produces a standalone HTML file playable in any browser — no server, no dependencies, at the point it's actually played.

Built for CSE3CWA. Word lists and activity settings are stored in PostgreSQL and managed through a real API and the Manage page, and a live Dashboard reports health, usage and generation statistics.

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

- `src/app/` — routes: Home, About, Wordle, Word Search, Manage, Dashboard, Settings, plus the `health` route and the `api/` route handlers below
- `src/components/` — layout (Header/NavBar/Footer), theme toggle, thin React "host" wrappers for each game, and the `manage/` content-management UI
- `src/lib/api/` — the CRUD API's shared error handling (`errors.ts`) and Zod validation schemas (`validation.ts`), plus the client-side fetch layer (`client.ts`) the game components use
- `src/lib/` — puzzle-generation and export logic, and `phonemes.ts`/`wordSearch.ts`'s hardcoded corpus, which is now only `prisma/seed.ts`'s source of truth (see below)
- `e2e/` — Playwright end-to-end tests (see below)
- `load-tests/` — JMeter load test plan, staged runner and results summary (see below)
- `public/engines/` — the actual Wordle and Word Search game engines: plain JavaScript, no imports, no build step
- `prisma/` — the database schema, migrations, and seed script

### Why the games live in `public/engines/` instead of as React components

The "Generate HTML" button has to produce a single, fully standalone `.html` file — no React runtime, no bundler, works offline by double-clicking it. Rather than maintaining two implementations of each game (one in JSX for the live preview, one hand-ported to vanilla JS for the export — which could silently drift apart), each game's actual logic and rendering lives in exactly one place: a plain-JS "engine" in `public/engines/`. The live app loads and mounts that same file via a thin React host component (`useRef` + `useEffect`), and the export function serializes the exact options object that was passed to `mount()` — the generated file's data can't drift from what was on screen, by construction. The host components source that data from the API (see below) rather than hardcoded constants; the engines themselves don't know or care where it came from.

## Database and API

Word lists, their words' ordered phoneme sequences, the fixed 43-symbol phoneme reference inventory, and activity configurations (Wordle/Word Search settings — difficulty, max guesses, grid size, hints) are modeled in `prisma/schema.prisma` and backed by PostgreSQL. See the schema file and `prisma/seed.ts` for the full shape.

Routes under `src/app/api/` (plus `/health`):

| Route | Methods | Notes |
| --- | --- | --- |
| `/health`, `/api/health` | GET | Real DB connectivity check, not a static 200 (503 when the database is down) |
| `/api/phonemes` | GET | Read-only — the phoneme inventory is fixed reference data |
| `/api/word-lists` | GET, POST | |
| `/api/word-lists/[id]` | GET, PATCH, DELETE | Delete is rejected (409) if an Activity still references the list |
| `/api/word-lists/[id]/words` | POST | Add a word; every phoneme is checked against the reference inventory |
| `/api/words/[id]` | PATCH, DELETE | |
| `/api/activities` | GET (`?type=WORDLE\|WORD_SEARCH`), POST | Create validates Wordle vs. Word Search's different required settings |
| `/api/activities/[id]` | GET, PATCH, DELETE | |
| `/api/telemetry/generation` | POST | Records whether building or exporting an activity succeeded or failed, and why |
| `/api/telemetry/page-view` | POST | Records how long a page was visible |
| `/api/dashboard/stats` | GET | Aggregated statistics, health and alerts for the Dashboard |

The Wordle and Word Search pages each show a selector over the real activities of that type returned by the API — adding an activity makes it available to play with no code change.

Teachers manage word lists, words, and activities through the **Manage** page (in the nav menu) — create/rename/delete word lists, add/edit/delete words (with a click-to-build phoneme picker rather than free text, since IPA symbols aren't typeable on a normal keyboard), and create/edit/delete activities. This drives the same API above; it's not a separate data path.

## Dashboard and observability

The **Dashboard** page (`/dashboard`) shows how the system is being used and whether it is healthy, refreshing every 10 seconds. The data flows in four steps:

1. **Record.** When a Wordle or Word Search is built, or exported with "Generate HTML", the page posts a success or failure (with the reason) to `/api/telemetry/generation`. A small tracker in the root layout posts how long each page was visible to `/api/telemetry/page-view`, ignoring views under half a second.
2. **Store.** These become `GenerationEvent` and `PageView` rows in PostgreSQL. Rows created by `npm run db:simulate` carry a `simulated` flag, so they can be replaced or removed without touching real usage.
3. **Aggregate.** `/api/dashboard/stats` counts activities by type, successful and failed generations, the success rate, the average time on a page and the most-used activity type, and lists the most recent failures.
4. **Alert.** The same endpoint evaluates warnings: any generation failure in the last 24 hours, a failure rate of 20% or more (an error from 50%, once there are at least ten attempts), word lists with no words, Wordle activities with no word of the right phoneme count, and an error with an unavailable view when the database is unreachable.

The Dashboard also summarises the stored word lists and activity configurations, so what a teacher builds on the Manage page and how it is used appear in one place.

## Database (local dev)

```bash
npm run db:up      # starts Postgres via Docker Compose
npm run db:migrate  # applies the Prisma schema
npm run db:seed     # populates it with the current word/phoneme data
npm run db:simulate # optional: fills the dashboard with simulated usage history
npm run db:studio   # optional: browse the database at http://localhost:5555
```

`npm run db:simulate` inserts simulated generation events and page views spread over the last 14 days, tied to the activities that exist, so the Dashboard has history to report on without hours of manual use. Pass `-- --count=500 --days=30` to change the size and window. Every simulated row is flagged `simulated`, so re-running replaces the previous simulation and `npm run db:simulate:clear` removes it, leaving real usage records untouched. The generator is seeded, so the same options produce the same figures every time. Run `npm run db:seed` first — activities are needed to attach events to.

## Running with Docker

`docker-compose.yml` has an `app` service (the Next.js app itself, built from the root `Dockerfile` using `output: "standalone"` for a minimal runtime image) alongside `db`.

```bash
cp .env.example .env   # first time only
docker compose up -d --build
npm run db:migrate      # migrations run against the container from the host, same as local dev
npm run db:seed
```

The app is then reachable at [http://localhost:3000](http://localhost:3000) (override with `APP_PORT` in `.env` if that port is taken, the same way `POSTGRES_PORT` overrides Postgres's).

## End-to-end tests

Playwright tests drive the real app in Chromium against the real database, so Postgres must be running and seeded (see Getting started).

```bash
npx playwright install chromium   # first time only
npm run test:e2e                  # starts the dev server on port 3100 if one is not already running
npm run test:e2e:report           # opens the HTML report of the last run
```

| Spec | What it proves |
| --- | --- |
| `e2e/builder.spec.ts` | A teacher creates, edits, renames and deletes a word list, its words and a Wordle activity through the Manage page |
| `e2e/activities.spec.ts` | A player wins a Wordle round, an incomplete guess is rejected, Word Search renders a full grid, and both "Generate HTML" exports open as standalone playable files |
| `e2e/observability.spec.ts` | Both health endpoints return 200, generation and page-time events are recorded and shown on the Dashboard, and unplayable activities and empty word lists raise alerts |

The tests create their own word lists and activities, prefixed `E2E `, and remove everything with that prefix before and after each test, so leftovers from a crashed run are swept up. Because they use the real UI, they also record genuine generation and page-view events. Set `E2E_PORT` to use another port, or `E2E_BASE_URL` (for example `http://localhost:3010`) to test an app that is already running, such as the Docker container.

## Load testing

An [Apache JMeter](https://jmeter.apache.org/) plan (`load-tests/phoneme-wordle.jmx`) exercises the builder and the generated-activity workflow at five staged levels. JMeter is free (Apache License 2.0) and needs Java 8 or newer; `run.sh` looks for it on `PATH`, in `JMETER_HOME`, or in `~/tools/apache-jmeter-*`.

Test the production container, not `npm run dev`: start it with `docker compose up -d` (the app listens on `http://localhost:3010`) and make sure the database is seeded.

```bash
load-tests/run.sh                    # all five stages, about 7 minutes
load-tests/run.sh x10 x100           # chosen stages only
DURATION=20 load-tests/run.sh x10    # a quick 20-second run
node load-tests/summarize.mjs        # reprint the comparison table
```

Each stage writes `load-tests/results/<stage>/` (gitignored) containing the raw samples and a full JMeter dashboard at `report/index.html`. Set `HOST` and `PORT` to target another server.

| Stage | Virtual users | Total time (including ramp-up) |
| --- | ---: | --- |
| x1 | 1 | 60 s (1 s ramp-up) |
| x10 | 10 | 60 s (5 s ramp-up) |
| x100 | 100 | 60 s (10 s ramp-up) |
| x1000 | 1,000 | 90 s (30 s ramp-up) |
| x10000 | 10,000 | 120 s (60 s ramp-up) |

Every virtual user repeatedly runs one of two workflows, chosen at random each time, pausing 0.5–1.5 s between requests, and every request must return a 2xx status:

| Workflow | Share of iterations | Requests |
| --- | ---: | --- |
| Player (Wordle or Word Search) | about 90% | open the page, list the activities, load one activity, its word list and the phonemes, then record the generation and the time on the page |
| Teacher | about 10% | list word lists, create a list, add two words, rename it, create and edit an activity, check the dashboard statistics, then delete the activity and the list |

Players never pick the transient activities teacher users create, since those are deleted moments later. After each stage the runner deletes any `LOAD ` word lists and activities, and the telemetry rows written since that stage began, so the dashboard returns to how it was (`CLEANUP=0` keeps them).

### Sample results

One run on a 16-core desktop with JMeter, the app container and PostgreSQL all on the same machine:

| Stage | Users | Requests | Errors | Mean (ms) | Median (ms) | 95th (ms) | 99th (ms) | Max (ms) | Throughput (req/s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| x1 | 1 | 64 | 0.00% | 11 | 9 | 22 | 23 | 23 | 1.1 |
| x10 | 10 | 559 | 0.00% | 9 | 7 | 16 | 19 | 25 | 9.5 |
| x100 | 100 | 5,424 | 0.00% | 6 | 5 | 12 | 16 | 26 | 91.5 |
| x1000 | 1,000 | 73,613 | 0.00% | 16 | 12 | 66 | 145 | 406 | 821.9 |
| x10000 | 10,000 | 98,268 | 0.34% | 8,689 | 13,858 | 22,219 | 25,527 | 30,031 | 761.7 |

- **x1 to x100:** response times stay in single or low double-digit milliseconds with no errors, and throughput grows in step with the number of users, because most of each user's time is spent pausing.
- **x1000:** still no errors, but the 99th percentile has risen to 145 ms and throughput is close to its ceiling.
- **x10000:** throughput does not grow (762 requests per second against 822 at x1000), so the extra users simply queue. The median response takes 13.9 s, 87% of requests take over a second, and 38,701 take over ten. The 334 errors are 314 read timeouts at the 30 s limit, 16 dropped connections and 4 follow-on 404s, so the 0.34% error rate understates how unusable the app is at this level.
- **What limits it:** sampling CPU during a near-saturation run showed the app's Node.js process at about 100–107% of one core, which is a fully busy single thread, while PostgreSQL used about 35–39% of one core, JMeter 15–25%, so the application process, not the database or the load generator, is the limit. The dashboard statistics request, which runs several aggregate queries, is the slowest request under load (95th percentile 111 ms at x1000 and 29.8 s at x10000).
- **What would raise the ceiling:** running several app instances behind a load balancer, caching the fixed phoneme list, and precomputing the dashboard totals. None of these is implemented.

A repeat run gave the same shape: 823 requests per second at x1000 and 754 at x10000, with the x10000 error rate at 0.75% instead of 0.34%, because the number of requests that hit the 30 s timeout varies from run to run.

## Building

```bash
npm run build
npm run lint
```
