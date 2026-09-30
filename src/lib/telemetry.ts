import type { ActivityType } from "@prisma/client";
import { db } from "@/lib/db";

export interface GenerationEventInput {
  activityType: ActivityType;
  activityId?: string | null;
  success: boolean;
  failureReason?: string | null;
}

export interface PageViewInput {
  path: string;
  activityType?: ActivityType | null;
  durationMs: number;
}

export function recordGenerationEvent(input: GenerationEventInput) {
  return db.generationEvent.create({
    data: {
      activityType: input.activityType,
      activityId: input.activityId ?? null,
      success: input.success,
      failureReason: input.success ? null : (input.failureReason ?? null),
    },
  });
}

export function recordPageView(input: PageViewInput) {
  return db.pageView.create({
    data: {
      path: input.path,
      activityType: input.activityType ?? null,
      durationMs: Math.max(0, Math.round(input.durationMs)),
    },
  });
}
