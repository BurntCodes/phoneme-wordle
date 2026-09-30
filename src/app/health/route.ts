import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/health";

// Probes and load balancers conventionally hit /health, outside the /api namespace.
export async function GET() {
  const result = await checkDatabaseHealth();
  return NextResponse.json(result.status, { status: result.httpStatus });
}
