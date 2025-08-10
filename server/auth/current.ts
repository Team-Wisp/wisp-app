import "server-only";
import { getSessionCookie } from "./session";
import { verifyJWT, AuthClaims } from "./jwt";
import Membership from "@/server/models/Membership";
import Organization from "@/server/models/Organization";

export async function getCurrentSession(): Promise<AuthClaims | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  try {
    return await verifyJWT(token);
  } catch {
    return null;
  }
}


export async function getCurrentContext(expectedOrgSlug?: string) {
  const token = await getSessionCookie();
  if (!token) return null;

  const claims = await verifyJWT(token) as AuthClaims;

  // Resolve membership → gives userId, orgId, handle, role
  const mem = await Membership.findById(claims.mid).lean() as any;
  if (!mem) return null;

  let org = null as any;
  if (expectedOrgSlug) {
    org = await Organization.findOne({ slug: expectedOrgSlug }).select("_id slug").lean();
    if (!org || String(org._id) !== String(mem.orgId)) return null; // org mismatch
  }

  return {
    membershipId: mem._id,
    userId: mem.userId,   
    orgId: mem.orgId,
    handle: mem.displayHandle,
    role: mem.role,
    tokenClaims: claims,
  };
}