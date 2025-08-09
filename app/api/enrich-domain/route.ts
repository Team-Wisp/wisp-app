import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { enrichDomain } from "@/server/services/domain-enrichment";
import { enrichDomainSchema } from "@/server/validation/enrich-domain";
import { verifyCaller } from "@/server/security/verify-caller";

export const runtime = "nodejs"; 

export async function POST(req: NextRequest) {
  try {
    // Verify this request is from your Go auth service
    const isTrusted = await verifyCaller(req);
    if (!isTrusted) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate payload
    const json = await req.json();
    const parsed = enrichDomainSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { domain, domainType } = parsed.data;

    await enrichDomain(domain, domainType);

    return NextResponse.json({ message: "Enrichment complete" }, { status: 200 });
  } catch (err) {
    console.error("Error in enrich-domain API:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
