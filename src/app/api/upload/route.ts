import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signUploadParams } from "@/lib/cloudinary";

/**
 * Signature endpoint for the admin upload widget.
 *
 * Signed uploads mean the account needs no unsigned upload preset — the secret
 * never leaves the server, and only a signed-in editor can obtain a signature.
 *
 * The signature has to cover exactly the parameters the browser will send, so
 * this signs `paramsToSign` verbatim; constraints are enforced by rejecting
 * unwanted values rather than by rewriting them.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paramsToSign } = await req.json();

    if (!paramsToSign || typeof paramsToSign !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const folder = String(paramsToSign.folder ?? "");
    if (!folder.startsWith("bejanko/")) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    return NextResponse.json({ signature: signUploadParams(paramsToSign) });
  } catch (err) {
    console.error("[api/upload]", err);
    return NextResponse.json({ error: "Could not sign upload" }, { status: 500 });
  }
}
