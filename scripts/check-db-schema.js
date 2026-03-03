/**
 * 检查数据库表结构
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
const db = new Database(dbPath);

try {
  // 查询 posts 表结构
  const postsSchema = db.pragma('table_info(posts)');
  console.log('\n=== posts 表结构 ===');
  console.log(JSON.stringify(postsSchema, null, 2));

  // 查询 ai_model_configs 表结构
  const aiModelConfigsSchema = db.pragma('table_info(ai_model_configs)');
  console.log('\n=== ai_model_configs 表结构 ===');
  console.log(JSON.stringify(aiModelConfigsSchema, null, 2));

  // 查询 ai_call_logs 表结构
  const aiCallLogsSchema = db.pragma('table_info(ai_call_logs)');
  console.log('\n=== ai_call_logs 表结构 ===');
  console.log(JSON.stringify(aiCallLogsSchema, null, 2));
} catch (error) {
  console.error('错误:', error.message);
} finally {
  db.close();
}
