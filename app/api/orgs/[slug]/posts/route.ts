import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {dbConnect} from "@/server/db";
import Post from "@/server/models/Posts";
import Organization from "@/server/models/Organization";
import { getCurrentContext } from "@/server/auth/current";
import { PostCategorySchema } from "@/server/models/PostCategory";

// keep categories in one place; if you have PostCategorySchema already, you can reuse it
const CreatePostSchema = z.object({
  category: PostCategorySchema,         
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  tags: z.array(z.string().min(1).max(32)).max(10).optional(),
});


export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();

  // session/membership check and org consistency
  const ctx = await getCurrentContext(params.slug);
  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // (defense-in-depth) ensure the org slug exists
  const org = await Organization.findOne({ slug: params.slug }).select("_id").lean();
  if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

  // validate body
  let payload: z.infer<typeof CreatePostSchema>;
  try {
    payload = CreatePostSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ message: "Invalid payload", issues: e?.issues }, { status: 400 });
  }

  // Company board rule:
  // category === "company" simply means "post to my company's board"
  // which is the same org as the current session (ctx.orgId).
  const doc = await Post.create({
    orgId: ctx.orgId,
    category: payload.category,
    title: payload.title,
    body: payload.body,
    authorMembershipId: ctx.membershipId,
    authorHandleSnapshot: ctx.handle,
    tags: payload.tags ?? [],
  });

  return NextResponse.json({ id: doc._id }, { status: 201 });
}
