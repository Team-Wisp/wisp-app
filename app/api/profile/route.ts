import { NextResponse } from "next/server";
import {dbConnect} from "@/server/db";
import { getCurrentContext } from "@/server/auth/current";
import Organization from "@/server/models/Organization";

export async function GET() {
  await dbConnect();
  const ctx = await getCurrentContext();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });

  const org = await Organization.findById(ctx.orgId).select("slug name").lean() as { slug: string; name: string } | null;
  return NextResponse.json({
    ok: true,
    handle: ctx.handle,
    orgSlug: org?.slug,
    orgName: org?.name,
    role: ctx.role,
  });
}
