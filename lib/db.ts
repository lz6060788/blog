import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./db/schema";

// 创建 SQLite 数据库连接
const sqlite = new Database("./data/db.sqlite");

// 启用外键约束
sqlite.pragma("foreign_keys = ON");

// 创建 Drizzle 客户端
export const db = drizzle(sqlite, { schema });
