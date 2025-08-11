import {dbConnect} from "@/server/db";
import { getCurrentContext } from "@/server/auth/current";
import Post from "@/server/models/Posts";
import Comment from "@/server/models/Comments";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod validation for comment body
const CreateCommentSchema = z.object({
  body: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const ctx = await getCurrentContext();
  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await Post.findById(params.id) as (InstanceType<typeof Post> & { isDeleted?: boolean }) | null;
  if (!post || post.isDeleted) return NextResponse.json({ message: "Post not found" }, { status: 404 });

  // Validate comment body
  let payload: z.infer<typeof CreateCommentSchema>;
  try {
    payload = CreateCommentSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ message: "Invalid comment body", issues: e?.issues }, { status: 400 });
  }

  const comment = await Comment.create({
    postId: post._id,
    authorMembershipId: ctx.membershipId,
    body: payload.body,
  });

  // Increment comment count on post
  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });

  return NextResponse.json({ id: comment._id }, { status: 201 });
}

// helpers for pagination (same as feed)
function encodeCursor(t: Date, id: string) {
  return Buffer.from(JSON.stringify({ t: t.toISOString(), id }), "utf8").toString("base64url");
}
function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try { return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { t: string; id: string }; }
  catch { return null; }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
  const cursorRaw = searchParams.get("cursor");
  const cursor = decodeCursor(cursorRaw);

  const q: any = { postId: params.id, isDeleted: false };

  if (cursor?.t && cursor?.id) {
    const t = new Date(cursor.t);
    q.$or = [
      { createdAt: { $lt: t } },
      { createdAt: t, _id: { $lt: cursor.id } },
    ];
  }

  const docs = await Comment.find(q)
    .sort({ createdAt: 1, _id: 1 }) // ascending by creation date
    .limit(limit + 1)
    .select("_id authorMembershipId body createdAt")
    .lean();

  const hasMore = docs.length > limit;
  const data = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore
    ? encodeCursor(data[data.length - 1].createdAt, String(data[data.length - 1]._id))
    : null;

  return NextResponse.json({ data, nextCursor });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const ctx = await getCurrentContext();
  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const comment = await Comment.findById(params.id).lean() as (typeof Comment extends { schema: infer S } ? S extends { obj: infer O } ? O & { _id: any } : any : any) | null;
  if (!comment || (comment as any).isDeleted) return NextResponse.json({ message: "Comment not found" }, { status: 404 });

  if (String((comment as any).authorMembershipId) !== String(ctx.membershipId)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Mark comment as deleted
  await Comment.updateOne({ _id: params.id }, { $set: { isDeleted: true } });
  await Post.updateOne({ _id: (comment as any).postId }, { $inc: { commentCount: -1 } });

  return NextResponse.json({ ok: true });
}
