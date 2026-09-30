import { db } from "@/lib/db";

export interface HealthResult {
  ok: boolean;
  status: { status: "ok" | "error"; database: "up" | "down"; message?: string };
  httpStatus: 200 | 503;
}

export async function checkDatabaseHealth(): Promise<HealthResult> {
  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true, status: { status: "ok", database: "up" }, httpStatus: 200 };
  } catch (error) {
    return {
      ok: false,
      status: {
        status: "error",
        database: "down",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      httpStatus: 503,
    };
  }
}
