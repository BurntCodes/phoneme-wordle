import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(resource: string): ApiError {
  return new ApiError(404, `${resource} not found`);
}

// Maps a caught route-handler error to a JSON response. Prisma's known
// request errors carry a stable `code` (P2002/P2003/P2025) we can turn
// into clear, specific messages instead of a raw 500 — the brief asks for
// "clear error messages", not just non-crashing behaviour.
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          { error: "A record with this value already exists", details: error.meta },
          { status: 409 },
        );
      case "P2003":
        return NextResponse.json(
          { error: "This record is still referenced by other data and cannot be deleted", details: error.meta },
          { status: 409 },
        );
      case "P2025":
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
