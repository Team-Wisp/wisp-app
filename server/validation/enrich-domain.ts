import { z } from "zod";
import { OrganizationType } from "@/server/models/OrganizationType";

export const enrichDomainSchema = z.object({
  domain: z.string().trim().toLowerCase().min(3).regex(/\./, "Must be a domain"),
  domainType: z.nativeEnum(OrganizationType),
});
