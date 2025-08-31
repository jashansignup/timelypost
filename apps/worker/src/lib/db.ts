import { PrismaClient } from "@repo/database";
import * as Redis from "ioredis";

export const redis = new (Redis as any).default(process.env.VALKEY_URL!, {
  tls: process.env.VALKEY_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: null,
});
export const db = new PrismaClient();
