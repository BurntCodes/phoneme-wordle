# Phoneme Word Games

A builder for phoneme-based Wordle and Word Search classroom activities, aimed at Speech Pathology students and teachers. Teachers configure an activity, preview it, and generate a standalone HTML file that plays in any browser — no server, no dependencies.

Built for CSE3CWA, Assessment 1 (frontend design and usability).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whichever port the terminal prints, if 3000 is already in use).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4

## Project structure

- `src/app/` — routes: Home, About, Wordle, Word Search, Settings
- `src/components/` — layout (Header/NavBar/Footer), theme toggle, and thin React "host" wrappers for each game
- `src/lib/` — phoneme corpus data, game logic (word selection, puzzle generation), and the HTML export generators
- `public/engines/` — the actual Wordle and Word Search game engines: plain JavaScript, no imports, no build step

### Why the games live in `public/engines/` instead of as React components

The "Generate HTML" button has to produce a single, fully standalone `.html` file — no React runtime, no bundler, works offline by double-clicking it. Rather than maintaining two implementations of each game (one in JSX for the live preview, one hand-ported to vanilla JS for the export — which could silently drift apart), each game's actual logic and rendering lives in exactly one place: a plain-JS "engine" in `public/engines/`. The live app loads and mounts that same file via a thin React host component (`useRef` + `useEffect`), and the export function fetches that same file's own text and inlines it verbatim into the generated document. One implementation, two consumers, no duplication.

## Building

```bash
npm run build
npm run lint
```
