import { z } from "zod";

const schema = z.object({
  MONGODB_URI: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  AUTH_WEBHOOK_SECRET: z.string().min(1),
});

export const env = schema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AUTH_WEBHOOK_SECRET: process.env.AUTH_WEBHOOK_SECRET,
});
