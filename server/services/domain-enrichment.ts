import { dbConnect } from "@/server/db";
import Organization from "@/server/models/Organization";
import { OrganizationType } from "@/server/models/OrganizationType";
import { makeSlug } from "@/server/utils/slug";
import OpenAI from "openai";
import { env } from "@/server/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function enrichDomain(domain: string, domainType: OrganizationType) {
  await dbConnect();

  // idempotency: skip if present
  const existing = await Organization.findOne({ domain });
  if (existing) return;

  const orgName = await fetchOrgNameFromOpenAI(domain);

  const name = orgName || "Unknown";
  const slug = makeSlug(name);

  await Organization.create({
    name,
    domain,
    type: domainType,
    slug,
  });
}

async function fetchOrgNameFromOpenAI(domain: string): Promise<string> {
  try {
    const prompt = `Return only the full legal organization name associated with the domain ${domain}. No description or explanation.`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
      temperature: 0.1,
    });

    const name = resp.choices?.[0]?.message?.content?.trim() ?? "";
    return name;
  } catch (e) {
    console.error("[OpenAI] Failed to fetch org name:", e);
    return "";
  }
}
