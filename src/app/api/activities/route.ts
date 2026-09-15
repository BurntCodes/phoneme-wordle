import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError, notFound } from "@/lib/api/errors";
import { activityCreateSchema } from "@/lib/api/validation";
import { ActivityType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get("type");
    if (type && !Object.values(ActivityType).includes(type as ActivityType)) {
      throw new ApiError(400, "Invalid type filter", { allowed: Object.values(ActivityType) });
    }

    const activities = await db.activity.findMany({
      where: type ? { type: type as ActivityType } : undefined,
      orderBy: { name: "asc" },
      include: { wordList: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ activities });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = activityCreateSchema.parse(await request.json());

    const wordList = await db.wordList.findUnique({ where: { id: body.wordListId } });
    if (!wordList) throw notFound("WordList");

    const activity = await db.activity.create({ data: body });
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
