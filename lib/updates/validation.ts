import { AppError } from "./types.ts";
import type {
  EditPost,
  PlaneActivity,
  PostContent,
  Submission,
} from "./types.ts";

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("Expected a JSON object.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new AppError(
      `${name} must be nonempty text of at most ${max} characters.`,
    );
  }
  return value.trim();
}

function optionalText(
  value: unknown,
  name: string,
  max: number,
): string | null {
  return value === undefined || value === null || value === ""
    ? null
    : text(value, name, max);
}

function publicUrl(value: unknown, name: string): string | null {
  const input = optionalText(value, name, 2048);
  if (!input) return null;
  try {
    const url = new URL(input);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
    return url.href;
  } catch {
    throw new AppError(
      `${name} must be an HTTP or HTTPS URL without credentials.`,
    );
  }
}

function day(value: unknown, name: string): string {
  const input = text(value, name, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input))
    throw new AppError(`${name} must use YYYY-MM-DD.`);
  const parsed = new Date(input + "T00:00:00Z");
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== input
  ) {
    throw new AppError(`${name} is not a valid calendar date.`);
  }
  return input;
}

function content(input: Record<string, unknown>): PostContent {
  const image = input.image ?? "engineering";
  if (image !== "engineering" && image !== "concept" && image !== "flight") {
    throw new AppError("image must be engineering, concept, or flight.");
  }
  return {
    title: text(input.title, "title", 140),
    summary: text(input.summary, "summary", 600),
    body: text(input.body, "body", 30000),
    category: text(input.category ?? "Project", "category", 48),
    image,
    href: publicUrl(input.href, "href"),
  };
}

export function parseSubmission(value: unknown): Submission {
  const input = object(value);
  const periodStart = day(input.periodStart, "periodStart");
  const periodEnd = day(input.periodEnd, "periodEnd");
  if (periodStart >= periodEnd)
    throw new AppError(
      "periodEnd must be after periodStart (the end date is exclusive).",
    );
  if (!Array.isArray(input.activities) || input.activities.length > 1000) {
    throw new AppError(
      "activities must be an array of at most 1000 Plane activity records.",
    );
  }
  const seen = new Set<string>();
  const activities: PlaneActivity[] = input.activities.map((value) => {
    const event = object(value);
    const id = text(event.id, "activity.id", 160);
    if (seen.has(id))
      throw new AppError(
        "Each activity ID must appear only once in a submission.",
      );
    seen.add(id);
    const timestamp = text(event.createdAt, "activity.createdAt", 40);
    if (
      !/^\d{4}-\d{2}-\d{2}T/.test(timestamp) ||
      !Number.isFinite(Date.parse(timestamp))
    ) {
      throw new AppError(
        "activity.createdAt must be an ISO timestamp including its time zone.",
      );
    }
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(timestamp))
      throw new AppError("activity.createdAt needs a time zone.");
    const createdAt = new Date(timestamp).toISOString();
    if (
      createdAt < periodStart + "T00:00:00.000Z" ||
      createdAt >= periodEnd + "T00:00:00.000Z"
    ) {
      throw new AppError(
        "Every activity must fall within the reporting period [start, end). ",
      );
    }
    return {
      id,
      workItemId: text(event.workItemId, "activity.workItemId", 160),
      createdAt,
      field: optionalText(event.field, "activity.field", 160),
      verb: optionalText(event.verb, "activity.verb", 160),
      oldValue: optionalText(event.oldValue, "activity.oldValue", 8000),
      newValue: optionalText(event.newValue, "activity.newValue", 8000),
      comment: optionalText(event.comment, "activity.comment", 8000),
      actor: optionalText(event.actor, "activity.actor", 160),
      url: publicUrl(event.url, "activity.url"),
    };
  });
  return { ...content(input), periodStart, periodEnd, activities };
}

export function parseEdit(value: unknown): EditPost {
  const input = object(value);
  if (!Number.isSafeInteger(input.version) || (input.version as number) < 1) {
    throw new AppError("A current post version is required.");
  }
  if (input.status !== "published" && input.status !== "unpublished") {
    throw new AppError("status must be published or unpublished.");
  }
  return {
    ...content(input),
    version: input.version as number,
    status: input.status,
  };
}

export function username(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9._-]{3,64}$/.test(value)) {
    throw new AppError(
      "Username must contain 3–64 letters, digits, dots, underscores, or hyphens.",
    );
  }
  return value.toLowerCase();
}
