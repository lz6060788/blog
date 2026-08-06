import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gzipSync, gunzipSync } from "node:zlib";
import path from "node:path";
import { Client } from "pg";

const BACKUP_FORMAT = "irises-blog-postgres-logical-backup";
const BACKUP_VERSION = 1;
const SCHEMAS = ["public", "drizzle"] as const;

type EncodedValue = unknown;

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  return readFile(path.join(process.cwd(), ".env.local"), "utf8").then(
    (content) => {
      const line = content
        .split(/\r?\n/)
        .find((item) => item.startsWith("DATABASE_URL="));

      if (!line) {
        throw new Error("DATABASE_URL was not found in the environment or .env.local");
      }

      return line
        .slice("DATABASE_URL=".length)
        .trim()
        .replace(/^['"]|['"]$/g, "");
    },
  );
}

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function encodeValue(value: unknown): EncodedValue {
  if (value instanceof Date) {
    return { $type: "date", value: value.toISOString() };
  }

  if (Buffer.isBuffer(value)) {
    return { $type: "buffer", value: value.toString("base64") };
  }

  if (typeof value === "bigint") {
    return { $type: "bigint", value: value.toString() };
  }

  if (Array.isArray(value)) return value.map(encodeValue);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, encodeValue(child)]),
    );
  }

  return value;
}

async function main() {
  const databaseUrl = await loadDatabaseUrl();
  const connection = new URL(databaseUrl);
  const client = new Client({ connectionString: databaseUrl });
  const startedAt = new Date();

  await client.connect();

  try {
    await client.query("begin isolation level repeatable read read only");

    const databaseResult = await client.query<{
      database_name: string;
      server_version: string;
    }>(
      "select current_database() as database_name, current_setting('server_version') as server_version",
    );

    const tableResult = await client.query<{
      schema_name: string;
      table_name: string;
    }>(
      `select schemaname as schema_name, tablename as table_name
       from pg_catalog.pg_tables
       where schemaname = any($1::text[])
       order by schemaname, tablename`,
      [SCHEMAS],
    );

    const tables: Array<{
      schema: string;
      name: string;
      rowCount: number;
      columns: unknown[];
      constraints: unknown[];
      indexes: unknown[];
      rows: EncodedValue[];
    }> = [];

    for (const table of tableResult.rows) {
      const columns = await client.query(
        `select column_name, ordinal_position, column_default, is_nullable,
                data_type, udt_schema, udt_name
         from information_schema.columns
         where table_schema = $1 and table_name = $2
         order by ordinal_position`,
        [table.schema_name, table.table_name],
      );
      const constraints = await client.query(
        `select constraint_name, constraint_type
         from information_schema.table_constraints
         where table_schema = $1 and table_name = $2
         order by constraint_name`,
        [table.schema_name, table.table_name],
      );
      const indexes = await client.query(
        `select indexname as index_name, indexdef as index_definition
         from pg_catalog.pg_indexes
         where schemaname = $1 and tablename = $2
         order by indexname`,
        [table.schema_name, table.table_name],
      );
      const rows = await client.query(
        `select * from ${quoteIdentifier(table.schema_name)}.${quoteIdentifier(table.table_name)}`,
      );

      tables.push({
        schema: table.schema_name,
        name: table.table_name,
        rowCount: rows.rowCount ?? rows.rows.length,
        columns: columns.rows,
        constraints: constraints.rows,
        indexes: indexes.rows,
        rows: rows.rows.map((row) => encodeValue(row)),
      });
    }

    await client.query("commit");

    const payload = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      createdAt: startedAt.toISOString(),
      source: {
        host: connection.hostname,
        database: databaseResult.rows[0].database_name,
        serverVersion: databaseResult.rows[0].server_version,
        schemas: SCHEMAS,
      },
      tables,
    };
    const compressed = gzipSync(Buffer.from(JSON.stringify(payload)), { level: 9 });
    const checksum = createHash("sha256").update(compressed).digest("hex");
    const stamp = startedAt.toISOString().replaceAll(":", "-").replaceAll(".", "-");
    const backupDirectory = path.join(process.cwd(), ".backups", "database");
    const backupPath = path.join(
      backupDirectory,
      `before-drafts-series-${stamp}.json.gz`,
    );
    const checksumPath = `${backupPath}.sha256`;

    await mkdir(backupDirectory, { recursive: true });
    await writeFile(backupPath, compressed, { flag: "wx" });
    await writeFile(checksumPath, `${checksum}  ${path.basename(backupPath)}\n`, {
      flag: "wx",
    });

    const verificationPayload = JSON.parse(
      gunzipSync(await readFile(backupPath)).toString("utf8"),
    ) as typeof payload;
    const verificationChecksum = createHash("sha256")
      .update(await readFile(backupPath))
      .digest("hex");
    const rows = verificationPayload.tables.reduce(
      (total, table) => total + table.rows.length,
      0,
    );

    if (
      verificationPayload.format !== BACKUP_FORMAT ||
      verificationPayload.version !== BACKUP_VERSION ||
      verificationChecksum !== checksum ||
      verificationPayload.tables.some(
        (table) => table.rows.length !== table.rowCount,
      )
    ) {
      throw new Error("Backup verification failed");
    }

    console.log(
      JSON.stringify(
        {
          backupPath,
          checksumPath,
          checksum,
          bytes: compressed.byteLength,
          tables: verificationPayload.tables.length,
          rows,
          verified: true,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
