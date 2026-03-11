import type { Config } from "drizzle-kit";

const sqliteFile = process.env.DATABASE_FILE ?? "./data/db.sqlite";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: sqliteFile,
  },
} satisfies Config;
