import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

type DbSchema = typeof schema;

declare global {
  // eslint-disable-next-line no-var
  var coachPortalPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var coachPortalDb: NodePgDatabase<DbSchema> | undefined;
}

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.coachPortalPool) {
    globalThis.coachPortalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL.includes("localhost") ||
        process.env.DATABASE_URL.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
    });
  }

  if (!globalThis.coachPortalDb) {
    globalThis.coachPortalDb = drizzle(globalThis.coachPortalPool, { schema });
  }

  return globalThis.coachPortalDb;
}
