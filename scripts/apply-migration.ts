import Database from "better-sqlite3";

// 创建 SQLite 数据库连接
const sqlite = new Database("./data/db.sqlite");

// 启用外键约束
sqlite.pragma("foreign_keys = ON");

console.log("Applying migration for categories and tags...");

try {
  // 开启事务
  sqlite.exec("BEGIN TRANSACTION");

  // 创建 categories 表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 创建 tags 表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 创建 post_tags 关联表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );
  `);

  // 添加新列到 posts 表
  // 检查列是否存在，如果不存在则添加
  const postsColumns = sqlite.prepare("PRAGMA table_info(posts)").all() as any[];
  const columnNames = postsColumns.map(col => col.name);

  if (!columnNames.includes("categoryId")) {
    sqlite.exec("ALTER TABLE posts ADD COLUMN categoryId TEXT REFERENCES categories(id) ON DELETE SET NULL");
  }

  if (!columnNames.includes("read_time")) {
    sqlite.exec("ALTER TABLE posts ADD COLUMN read_time INTEGER DEFAULT 0 NOT NULL");
  }

  if (!columnNames.includes("published_date")) {
    sqlite.exec("ALTER TABLE posts ADD COLUMN published_date TEXT");
  }

  // 提交事务
  sqlite.exec("COMMIT");

  console.log("✓ Migration applied successfully!");
} catch (error) {
  // 回滚事务
  sqlite.exec("ROLLBACK");
  console.error("✗ Migration failed:", error);
  process.exit(1);
} finally {
  sqlite.close();
}
