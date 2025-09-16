import { PrismaClient } from "@prisma/client";
// import Redis from "iovalkey";

// export const redis = new Redis(process.env.VALKEY_URL!, {
//   tls: process.env.VALKEY_TLS === "true" ? {} : undefined, // needed for managed TLS endpoints
//   maxRetriesPerRequest: null, // common with ioredis/iovalkey in serverless
// });

const globalForPrisma = global as unknown as { db: PrismaClient };

export const db =
  globalForPrisma.db ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
