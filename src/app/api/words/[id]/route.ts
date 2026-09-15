import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api/errors";
import { wordUpdateSchema } from "@/lib/api/validation";
import { assertKnownPhonemes } from "@/lib/api/phonemeCheck";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = wordUpdateSchema.parse(await request.json());

    const existing = await db.word.findUnique({ where: { id } });
    if (!existing) throw notFound("Word");

    if (body.phonemes) {
      await assertKnownPhonemes(body.phonemes);
    }

    // Phonemes are ordered and position-unique per word — replacing them
    // wholesale (delete + recreate) is simpler and less error-prone than
    // diffing old vs. new sequences for an in-place update.
    const word = await db.$transaction(async (tx) => {
      if (body.text !== undefined) {
        await tx.word.update({ where: { id }, data: { text: body.text } });
      }
      if (body.phonemes) {
        await tx.wordPhoneme.deleteMany({ where: { wordId: id } });
        await tx.wordPhoneme.createMany({
          data: body.phonemes.map((symbol, position) => ({
            wordId: id,
            phonemeSymbol: symbol,
            position,
          })),
        });
      }
      return tx.word.findUniqueOrThrow({
        where: { id },
        include: { phonemes: { orderBy: { position: "asc" } } },
      });
    });

    return NextResponse.json({ word });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.word.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
