import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api/errors";

// Read-only: the phoneme inventory is fixed reference data (seeded once),
// not teacher-editable content. Exposed so clients can validate/display
// against the real known set instead of duplicating it in frontend code.
export async function GET() {
  try {
    const phonemes = await db.phoneme.findMany({ orderBy: { displayOrder: "asc" } });
    return NextResponse.json({ phonemes });
  } catch (error) {
    return handleApiError(error);
  }
}
