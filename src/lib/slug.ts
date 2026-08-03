import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

type SluggedModel = "essay" | "note" | "book" | "authorProfile" | "contest" | "guestPost";

/**
 * Turns a title into a slug that is free on the given table.
 *
 * Every slug column in the schema is `@unique`, so without this a second
 * "Marginalia as Method" — or a second guest submission sharing a title —
 * fails the insert with P2002 and surfaces as a generic 500.
 *
 * `excludeId` lets an update keep its own slug instead of colliding with itself.
 */
export async function uniqueSlug(
  model: SluggedModel,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title) || "untitled";

  // Prisma's delegates share this shape at runtime but not a common TS type.
  const delegate = db[model] as unknown as {
    findFirst(args: {
      where: { slug: string; id?: { not: string } };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const clash = await delegate.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!clash) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
