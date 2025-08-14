import {dbConnect} from "@/server/db";
import Organization from "@/server/models/Organization";
import Post from "@/server/models/Posts";
import { NextRequest, NextResponse } from "next/server";

// helpers for stable cursor pagination
function encodeCursor(t: Date, id: string) {
  return Buffer.from(JSON.stringify({ t: t.toISOString(), id }), "utf8").toString("base64url");
}
function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try { return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { t: string; id: string }; }
  catch { return null; }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
  const category = searchParams.get("category") || undefined;
  const cursorRaw = searchParams.get("cursor");
  const cursor = decodeCursor(cursorRaw);

  const q: any = { isDeleted: false };
  if (category) q.category = category;

  // createdAt/_id tie-breaker for stable pagination
  if (cursor?.t && cursor?.id) {
    const t = new Date(cursor.t);
    q.$or = [
      { createdAt: { $lt: t } },
      { createdAt: t, _id: { $lt: cursor.id } },
    ];
  }

  const docs = await Post.find(q)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select("_id orgId category title body authorHandleSnapshot likeCount commentCount createdAt")
    .lean();

  const hasMore = docs.length > limit;
  const slice = hasMore ? docs.slice(0, limit) : docs;

  // attach org snapshot
  const orgIds = Array.from(new Set(slice.map(d => String(d.orgId))));
  const orgs = await Organization.find({ _id: { $in: orgIds } }).select("_id name slug").lean();
  const map = new Map(orgs.map(o => [String(o._id), { name: o.name, slug: o.slug }]));
  const data = slice.map(d => ({ ...d, org: map.get(String(d.orgId)) || null }));

  const nextCursor = hasMore
    ? Buffer.from(JSON.stringify({ t: slice[slice.length-1].createdAt.toISOString(), id: String(slice[slice.length-1]._id) }), "utf8").toString("base64url")
    : null;

  return NextResponse.json({ data, nextCursor });
}
