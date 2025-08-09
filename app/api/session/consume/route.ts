import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/server/auth/jwt";
import { setSessionCookie } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ message: "Missing token" }, { status: 400 });

    // Verify the JWT signed by your Go service
    await verifyJWT(token);

    // Store the raw token in an HttpOnly cookie (server reads it later)
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("session/consume error:", e);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
