import {dbConnect} from "@/server/db";
import { getCurrentContext } from "@/server/auth/current";
import Post from "@/server/models/Posts";
import Reaction from "@/server/models/Reactions";
import Membership from "@/server/models/Membership";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await dbConnect();
  const ctx = await getCurrentContext(); // membership-only token
  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await Post.findById(params.id).select("_id orgId isDeleted").lean() as { _id: string; orgId: string; isDeleted?: boolean } | null;
  if (!post || post.isDeleted) return NextResponse.json({ message: "Post not found" }, { status: 404 });

  // membership must belong to the post's org
  const mem = await Membership.findOne({ _id: ctx.membershipId, orgId: post.orgId }).select("_id").lean() as { _id: string } | null;
  if (!mem) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    await Reaction.create({
      postId: post._id,
      authorMembershipId: mem._id,
      orgId: post.orgId,
    });
    await Post.updateOne({ _id: post._id }, { $inc: { likeCount: 1 } });
  } catch (err: any) {
    // Duplicate like (unique index) -> OK (idempotent)
    // MongoServerError code 11000
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await dbConnect();
  const ctx = await getCurrentContext();
  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await Post.findById(params.id).select("_id orgId isDeleted").lean() as { _id: string; orgId: string; isDeleted?: boolean } | null;
  if (!post || post.isDeleted) return NextResponse.json({ message: "Post not found" }, { status: 404 });

  // Only the same membership can unlike its own like
  const del = await Reaction.deleteOne({
    postId: post._id,
    authorMembershipId: ctx.membershipId,
  });

  if (del.deletedCount) {
    await Post.updateOne({ _id: post._id }, { $inc: { likeCount: -1 } });
  }

  return NextResponse.json({ ok: true });
}
