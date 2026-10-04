import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api/errors";
import { generationEventSchema } from "@/lib/api/validation";
import { recordGenerationEvent } from "@/lib/telemetry";

export async function POST(request: Request) {
  try {
    const body = generationEventSchema.parse(await request.json());

    // A failed generation is often failed *because* the activity is missing;
    // a dangling id would violate the FK and drop the very event worth keeping.
    const activity = body.activityId
      ? await db.activity.findUnique({ where: { id: body.activityId }, select: { id: true } })
      : null;

    await recordGenerationEvent({ ...body, activityId: activity?.id ?? null });
    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
