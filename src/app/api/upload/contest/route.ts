import { NextRequest, NextResponse } from "next/server";
import { signUploadParams } from "@/lib/cloudinary";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const ALLOWED_FOLDER = "bejanko/contest-entries";

/**
 * Public signature endpoint for contest-entry attachments.
 *
 * Entrants have no account, so this cannot sit behind auth. It is instead
 * pinned to a single folder and rate limited, so a leaked signature can only
 * ever add files to the entries folder at a low rate.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`upload:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60 * 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { paramsToSign } = await req.json();

    if (!paramsToSign || typeof paramsToSign !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (paramsToSign.folder !== ALLOWED_FOLDER) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    return NextResponse.json({ signature: signUploadParams(paramsToSign) });
  } catch (err) {
    console.error("[api/upload/contest]", err);
    return NextResponse.json({ error: "Could not sign upload" }, { status: 500 });
  }
}
