import "server-only";
import { getSessionCookie } from "./session";
import { verifyJWT, AuthClaims } from "./jwt";

export async function getCurrentSession(): Promise<AuthClaims | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  try {
    return await verifyJWT(token);
  } catch {
    return null;
  }
}
