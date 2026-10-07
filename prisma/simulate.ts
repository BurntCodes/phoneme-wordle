import "dotenv/config";
import { PrismaClient, ActivityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEFAULT_EVENT_COUNT = 300;
const DEFAULT_DAYS = 14;
const BATCH_SIZE = 500;
const WORDLE_SHARE = 0.6;
const FAILURE_RATE = 0.08;
const PAGE_VIEWS_PER_EVENT = 2;

// Generic transport-level failures only: a reason naming a specific word list
// would contradict the stored data on the dashboard.
const FAILURE_REASONS: Record<ActivityType, string[]> = {
  WORDLE: ["Failed to load activity", "Request to /api/word-lists failed with status 500"],
  WORD_SEARCH: ["Failed to load activity", "Request to /api/phonemes failed with status 503"],
};

interface PagePattern {
  path: string;
  activityType: ActivityType | null;
  weight: number;
  medianMs: number;
}

const PAGE_PATTERNS: PagePattern[] = [
  { path: "/wordle", activityType: "WORDLE", weight: 0.3, medianMs: 45_000 },
  { path: "/word-search", activityType: "WORD_SEARCH", weight: 0.2, medianMs: 70_000 },
  { path: "/manage", activityType: null, weight: 0.15, medianMs: 90_000 },
  { path: "/dashboard", activityType: null, weight: 0.1, medianMs: 25_000 },
  { path: "/about", activityType: null, weight: 0.1, medianMs: 15_000 },
  { path: "/", activityType: null, weight: 0.15, medianMs: 8_000 },
];

// A fixed seed keeps the demo numbers identical across runs, so figures
// quoted in a recording still match the dashboard afterwards.
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20261006);

function pick<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  let roll = random();
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const numeric = (name: string, fallback: number) => {
    const raw = args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
    const value = raw === undefined ? fallback : Number(raw);
    if (!Number.isInteger(value) || value <= 0) throw new Error(`--${name} must be a positive integer`);
    return value;
  };
  return { clearOnly: args.includes("--clear"), count: numeric("count", DEFAULT_EVENT_COUNT), days: numeric("days", DEFAULT_DAYS) };
}

// Recent days weigh heavier and activity clusters in working hours, so the
// history reads like real classroom use rather than uniform noise.
function randomTimestamp(days: number, now: Date): Date {
  const daysAgo = Math.floor(random() ** 1.5 * days);
  const hour = Math.min(21, Math.max(7, Math.round(13 + (random() + random() + random() - 1.5) * 5)));
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, Math.floor(random() * 60), Math.floor(random() * 60), 0);
  if (date > now) date.setDate(date.getDate() - 1);
  return date;
}

function randomDurationMs(medianMs: number): number {
  const normal = Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  return Math.min(30 * 60_000, Math.max(600, Math.round(medianMs * Math.exp(0.6 * normal))));
}

async function insertInBatches<T>(rows: T[], insert: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await insert(rows.slice(i, i + BATCH_SIZE));
  }
}

async function clearSimulated() {
  const [events, views] = await Promise.all([
    db.generationEvent.deleteMany({ where: { simulated: true } }),
    db.pageView.deleteMany({ where: { simulated: true } }),
  ]);
  return { events: events.count, views: views.count };
}

async function main() {
  const { clearOnly, count, days } = parseArgs();

  const cleared = await clearSimulated();
  console.log(`Cleared ${cleared.events} simulated generation events and ${cleared.views} simulated page views`);
  if (clearOnly) return;

  const activities = await db.activity.findMany({ select: { id: true, type: true } });
  if (activities.length === 0) {
    throw new Error("No activities found — run `npm run db:seed` first");
  }
  const byType = {
    WORDLE: activities.filter((a) => a.type === "WORDLE"),
    WORD_SEARCH: activities.filter((a) => a.type === "WORD_SEARCH"),
  };
  const available = (Object.keys(byType) as ActivityType[]).filter((type) => byType[type].length > 0);

  const now = new Date();

  const events = Array.from({ length: count }, () => {
    const preferred: ActivityType = random() < WORDLE_SHARE ? "WORDLE" : "WORD_SEARCH";
    const activityType = available.includes(preferred) ? preferred : available[0];
    const success = random() >= FAILURE_RATE;
    return {
      activityType,
      activityId: pick(byType[activityType]).id,
      success,
      failureReason: success ? null : pick(FAILURE_REASONS[activityType]),
      simulated: true,
      createdAt: randomTimestamp(days, now),
    };
  });

  const views = Array.from({ length: count * PAGE_VIEWS_PER_EVENT }, () => {
    const pattern = pickWeighted(PAGE_PATTERNS);
    return {
      path: pattern.path,
      activityType: pattern.activityType,
      durationMs: randomDurationMs(pattern.medianMs),
      simulated: true,
      createdAt: randomTimestamp(days, now),
    };
  });

  await insertInBatches(events, (data) => db.generationEvent.createMany({ data }));
  await insertInBatches(views, (data) => db.pageView.createMany({ data }));

  const failed = events.filter((e) => !e.success).length;
  console.log(`Inserted ${events.length} generation events (${failed} failed) and ${views.length} page views over ${days} days`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
