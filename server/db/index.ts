import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

// 创建 SQLite 数据库连接
const dbFile = process.env.DATABASE_FILE || "./data/db.sqlite";

// 确保数据库目录存在
const dbDir = path.dirname(dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbFile);

// 启用外键约束
sqlite.pragma("foreign_keys = ON");

// 创建 Drizzle 客户端
export const db = drizzle(sqlite, { schema });
