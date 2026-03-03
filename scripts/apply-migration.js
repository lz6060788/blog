const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
const db = new Database(dbPath);

// 创建 file_uploads 表
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS file_uploads (
    id text PRIMARY KEY NOT NULL,
    key text NOT NULL UNIQUE,
    filename text NOT NULL,
    size integer NOT NULL,
    mime_type text NOT NULL,
    uploader_id text NOT NULL,
    created_at text NOT NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;

// 创建索引
const createIndexSQL = `
  CREATE UNIQUE INDEX IF NOT EXISTS file_uploads_key_unique ON file_uploads (key);
`;

try {
  // 开启事务
  db.exec('BEGIN TRANSACTION');

  // 创建表
  db.exec(createTableSQL);
  console.log('✓ Created file_uploads table');

  // 创建索引
  db.exec(createIndexSQL);
  console.log('✓ Created index on file_uploads.key');

  // 提交事务
  db.exec('COMMIT');
  console.log('✓ Migration applied successfully');
} catch (error) {
  // 回滚事务
  db.exec('ROLLBACK');
  console.error('✗ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
