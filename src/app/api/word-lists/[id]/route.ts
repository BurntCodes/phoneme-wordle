import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError, notFound } from "@/lib/api/errors";
import { wordListUpdateSchema } from "@/lib/api/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const wordList = await db.wordList.findUnique({
      where: { id },
      include: { words: { include: { phonemes: { orderBy: { position: "asc" } } } } },
    });
    if (!wordList) throw notFound("WordList");
    return NextResponse.json({ wordList });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = wordListUpdateSchema.parse(await request.json());
    if (Object.keys(body).length === 0) {
      throw new ApiError(400, "No fields to update");
    }
    const wordList = await db.wordList.update({ where: { id }, data: body });
    return NextResponse.json({ wordList });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.wordList.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
