import {dbConnect} from "@/server/db";
import { getCurrentContext } from "@/server/auth/current";
import Organization from "@/server/models/Organization";
import Salary from "@/server/models/Salaries";  
import { NextRequest, NextResponse } from "next/server";
import Reviews from "@/server/models/Reviews";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();

  const ctx = await getCurrentContext(params.slug);
  if (!ctx) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const company = await Organization.findOne({ slug: params.slug }).lean() as { _id: string } | null;
  
  if (!company) return NextResponse.json({ message: "Company not found" }, { status: 404 });

  const { salary, jobTitle, location } = await req.json();

  const newSalary = await Salary.create({
    companyId: company._id,
    authorMembershipId: ctx.membershipId,
    salary,
    jobTitle,
    location,
  });

  return NextResponse.json({ id: newSalary._id }, { status: 201 });

}

// helpers for pagination (same as post feed pagination)
function encodeCursor(t: Date, id: string) {
  return Buffer.from(JSON.stringify({ t: t.toISOString(), id }), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { t: string; id: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();

  // Find the organization by slug
  const company = await Organization.findOne({ slug: params.slug }).select("_id").lean() as { _id: string } | null;
  if (!company) return NextResponse.json({ message: "Company not found" }, { status: 404 });

  // Parse query params for limit and cursor
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);
  const cursorRaw = searchParams.get("cursor");
  const cursor = decodeCursor(cursorRaw);

  const q: any = { companyId: company._id };

  // Handle pagination based on cursor
  if (cursor?.t && cursor?.id) {
    const t = new Date(cursor.t);
    q.$or = [
      { createdAt: { $lt: t } },
      { createdAt: t, _id: { $lt: cursor.id } },
    ];
  }

  const reviews = await Reviews.find(q)
    .sort({ createdAt: -1, _id: -1 })  // Sort by latest reviews first
    .limit(limit + 1)
    .select("_id rating comment authorMembershipId createdAt")
    .lean();

  // Determine if there is a next page
  const hasMore = reviews.length > limit;
  const data = hasMore ? reviews.slice(0, limit) : reviews;
  const nextCursor = hasMore
    ? encodeCursor(data[data.length - 1].createdAt, String(data[data.length - 1]._id))
    : null;

  return NextResponse.json({ data, nextCursor });
}

