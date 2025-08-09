import { NextRequest } from "next/server";
import { env } from "@/server/env";

export async function verifyCaller(req: NextRequest) {
  const secret = req.headers.get("x-auth-secret");
  return secret === env.AUTH_WEBHOOK_SECRET;
}
