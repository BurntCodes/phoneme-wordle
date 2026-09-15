import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api/errors";
import { wordInputSchema } from "@/lib/api/validation";
import { assertKnownPhonemes } from "@/lib/api/phonemeCheck";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: wordListId } = await params;
    const body = wordInputSchema.parse(await request.json());

    const wordList = await db.wordList.findUnique({ where: { id: wordListId } });
    if (!wordList) throw notFound("WordList");

    await assertKnownPhonemes(body.phonemes);

    const word = await db.word.create({
      data: {
        text: body.text,
        wordListId,
        phonemes: {
          create: body.phonemes.map((symbol, position) => ({ phonemeSymbol: symbol, position })),
        },
      },
      include: { phonemes: { orderBy: { position: "asc" } } },
    });

    return NextResponse.json({ word }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
