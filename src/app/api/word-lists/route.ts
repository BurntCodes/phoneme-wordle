import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api/errors";
import { wordListCreateSchema } from "@/lib/api/validation";

export async function GET() {
  try {
    const wordLists = await db.wordList.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { words: true, activities: true } } },
    });
    return NextResponse.json({ wordLists });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = wordListCreateSchema.parse(await request.json());
    const wordList = await db.wordList.create({ data: body });
    return NextResponse.json({ wordList }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
