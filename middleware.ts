import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("tw_session"));

  // (A) Signed-in users visiting "/" → go to feed (or /app)
  if (url.pathname === "/" && hasSession) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // (B) Guard app-only areas
  if (url.pathname.startsWith("/app")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*"],
};
