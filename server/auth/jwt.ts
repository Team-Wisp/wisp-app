import "server-only";
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export type AuthClaims = {
  sub: string;    // userId (hex)
  org: string;    // org slug
  orgType: string; // organization type
  mid: string;    // membershipId (hex)
  iat: number;
  exp: number;
};

export async function verifyJWT(token: string): Promise<AuthClaims> {
  const { payload } = await jose.jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });
  // lightweight shape check
  if (!payload.sub || !payload.org || !payload.mid) {
    throw new Error("Invalid token claims");
  }
  return payload as unknown as AuthClaims;
}
