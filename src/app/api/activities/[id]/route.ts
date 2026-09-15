import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError, notFound } from "@/lib/api/errors";
import { activityUpdateSchema } from "@/lib/api/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const activity = await db.activity.findUnique({
      where: { id },
      include: { wordList: { select: { id: true, name: true } } },
    });
    if (!activity) throw notFound("Activity");
    return NextResponse.json({ activity });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = activityUpdateSchema.parse(await request.json());
    if (Object.keys(body).length === 0) {
      throw new ApiError(400, "No fields to update");
    }

    if (body.wordListId) {
      const wordList = await db.wordList.findUnique({ where: { id: body.wordListId } });
      if (!wordList) throw notFound("WordList");
    }

    const activity = await db.activity.update({ where: { id }, data: body });
    return NextResponse.json({ activity });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.activity.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
