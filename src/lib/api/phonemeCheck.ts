import { db } from "@/lib/db";
import { ApiError } from "@/lib/api/errors";

// Zod can check "is this a non-empty string", but not "is this a phoneme
// that actually exists" — that requires a DB round trip against the
// Phoneme reference table (see prisma/schema.prisma's WordPhoneme model).
export async function assertKnownPhonemes(symbols: string[]): Promise<void> {
  const unique = Array.from(new Set(symbols));
  const found = await db.phoneme.findMany({
    where: { symbol: { in: unique } },
    select: { symbol: true },
  });
  const foundSet = new Set(found.map((p) => p.symbol));
  const unknown = unique.filter((s) => !foundSet.has(s));

  if (unknown.length > 0) {
    throw new ApiError(400, "Unknown phoneme symbol(s)", { unknown });
  }
}
