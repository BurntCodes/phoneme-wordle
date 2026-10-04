import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { pageViewSchema } from "@/lib/api/validation";
import { recordPageView } from "@/lib/telemetry";

export async function POST(request: Request) {
  try {
    const body = pageViewSchema.parse(await request.json());
    await recordPageView(body);
    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
