const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
const db = new Database(dbPath);

try {
  const schema = db.pragma('table_info(posts)');
  console.log('posts 表列数:', schema.length);

  const coverCols = schema.filter(c => c.name.includes('cover'));
  console.log('封面相关列:', coverCols.map(c => c.name));

  if (coverCols.length === 4) {
    console.log('✓ 封面字段已正确添加');
  } else {
    console.log('✗ 封面字段数量不正确，预期 4 个，实际', coverCols.length);
  }
} catch (error) {
  console.error('错误:', error.message);
} finally {
  db.close();
}
