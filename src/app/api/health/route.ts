import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "up" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: "error", database: "down", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 503 },
    );
  }
}
