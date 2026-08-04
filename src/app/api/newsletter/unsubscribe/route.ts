import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * One-click unsubscribe endpoint.
 *
 * RFC 8058 has inbox providers POST to the List-Unsubscribe URL with no user
 * interaction, so this must succeed without a confirmation step. The page at
 * /newsletter/unsubscribe handles humans who click the visible link.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ ok: true });

  try {
    await db.subscriber.updateMany({
      where: { token },
      data: { status: "UNSUBSCRIBED" },
    });
  } catch (err) {
    console.error("[api/newsletter/unsubscribe]", err);
  }

  // Always 200 — a mail provider retrying a failed unsubscribe helps nobody.
  return NextResponse.json({ ok: true });
}
