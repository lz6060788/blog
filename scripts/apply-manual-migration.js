/**
 * 手动执行迁移脚本
 * 运行: node scripts/apply-manual-migration.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
const db = new Database(dbPath);

// 读取迁移文件
const migrationSQL = fs.readFileSync(
  path.join(__dirname, '..', 'drizzle', '0008_clean_texas_twister.sql'),
  'utf-8'
);

console.log('开始执行迁移 0008...');

try {
  // 开启事务
  db.exec('BEGIN TRANSACTION');

  // 分割并执行 SQL 语句
  const statements = migrationSQL.split('--> statement-breakpoint');
  for (const statement of statements) {
    const trimmed = statement.trim();
    if (trimmed && !trimmed.startsWith('--')) {
      console.log('执行语句:', trimmed.substring(0, 50) + '...');
      db.exec(trimmed);
    }
  }

  // 提交事务
  db.exec('COMMIT');
  console.log('✓ 迁移 0008 执行成功');
} catch (error) {
  // 回滚事务
  db.exec('ROLLBACK');
  console.error('✗ 迁移失败:', error.message);
  console.error('详细错误:', error);
  process.exit(1);
} finally {
  db.close();
}
