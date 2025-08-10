import { getCurrentContext } from "@/server/auth/current";
import {dbConnect} from "@/server/db";
import Post from "@/server/models/Posts";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const post = await Post.findById(params.id)
    .select("_id orgId category title body authorHandleSnapshot likeCount commentCount viewCount createdAt isDeleted")
    .lean();
  if (!post || (post as any).isDeleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const ctx = await getCurrentContext(); // no org check needed here

  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await Post.findById(params.id).select("_id authorMembershipId isDeleted").lean() as { _id: unknown; authorMembershipId: unknown; isDeleted?: boolean } | null;
  if (!post || post.isDeleted) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (String(post.authorMembershipId) !== String(ctx.membershipId)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await Post.updateOne({ _id: params.id }, { $set: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}