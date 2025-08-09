import mongoose from "mongoose";
import { env } from "@/server/env";

// avoid multiple connections in dev
let cached = (global as any)._mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
