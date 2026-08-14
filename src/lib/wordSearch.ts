import { PHONEME_WORDS, type PhonemeWord } from "@/lib/phonemes";

export interface Coord {
  row: number;
  col: number;
}

export interface Placement {
  word: string;
  coords: Coord[];
}

export interface WordSearchPuzzle {
  grid: string[][];
  placements: Placement[];
}

const DIRECTIONS: Coord[] = [
  { row: 0, col: 1 },
  { row: 0, col: -1 },
  { row: 1, col: 0 },
  { row: -1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: -1 },
  { row: -1, col: 1 },
  { row: -1, col: -1 },
];

const WORD_SEARCH_WORD_LIST = ["bed", "ring", "hand", "frog", "desk"];

export const WORD_SEARCH_WORDS: PhonemeWord[] = PHONEME_WORDS.filter((w) =>
  WORD_SEARCH_WORD_LIST.includes(w.word),
);

function canPlace(
  grid: (string | null)[][],
  units: string[],
  start: Coord,
  dir: Coord,
  rows: number,
  cols: number,
): boolean {
  const endRow = start.row + dir.row * (units.length - 1);
  const endCol = start.col + dir.col * (units.length - 1);
  if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) return false;

  for (let i = 0; i < units.length; i++) {
    const row = start.row + dir.row * i;
    const col = start.col + dir.col * i;
    const existing = grid[row][col];
    if (existing && existing !== units[i]) return false;
  }
  return true;
}

export function buildPuzzle(
  words: PhonemeWord[],
  rows: number,
  cols: number,
): WordSearchPuzzle {
  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(null),
  );
  const placements: Placement[] = [];

  // Filler phonemes come from the word list itself, not the full keyboard,
  // so filler cells camouflage real answers instead of standing out.
  const pool = Array.from(new Set(words.flatMap((w) => w.phonemes)));

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const start = {
        row: Math.floor(Math.random() * rows),
        col: Math.floor(Math.random() * cols),
      };

      if (canPlace(grid, word.phonemes, start, dir, rows, cols)) {
        const coords = word.phonemes.map((_, i) => ({
          row: start.row + dir.row * i,
          col: start.col + dir.col * i,
        }));
        coords.forEach(({ row, col }, i) => {
          grid[row][col] = word.phonemes[i];
        });
        placements.push({ word: word.word, coords });
        placed = true;
      }
    }
  }

  const filledGrid: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? pool[Math.floor(Math.random() * pool.length)]),
  );

  return { grid: filledGrid, placements };
}

export function getPath(start: Coord, end: Coord): Coord[] | null {
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const isStraightLine = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!isStraightLine) return null;

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;

  return Array.from({ length: steps + 1 }, (_, i) => ({
    row: start.row + stepR * i,
    col: start.col + stepC * i,
  }));
}

export function matchWord(
  path: Coord[],
  grid: string[][],
  words: PhonemeWord[],
  foundWords: Set<string>,
): string | null {
  const forward = path.map(({ row, col }) => grid[row][col]).join("");
  const backward = [...path]
    .reverse()
    .map(({ row, col }) => grid[row][col])
    .join("");

  for (const word of words) {
    if (foundWords.has(word.word)) continue;
    const key = word.phonemes.join("");
    if (key === forward || key === backward) return word.word;
  }
  return null;
}
