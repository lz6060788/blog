/**
 * 添加 cover-generation 功能映射
 * 运行: node scripts/add-cover-function-mapping.js
 */

const Database = require('better-sqlite3')
const path = require('path')
const crypto = require('crypto')

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite')
const db = new Database(dbPath)

// 插入 cover-generation 功能映射
const insertSQL = `
  INSERT OR IGNORE INTO ai_function_mappings (id, function_name, model_config_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`

try {
  const id = crypto.randomBytes(16).toString('hex')
  const now = new Date().toISOString()

  const result = db.prepare(insertSQL).run(
    id,
    'cover-generation',
    null,
    now,
    now
  )

  if (result.changes > 0) {
    console.log('✓ 已添加 cover-generation 功能映射')
    console.log('  请在管理后台为该功能配置图像生成模型')
  } else {
    console.log('✓ cover-generation 功能映射已存在，跳过')
  }
} catch (error) {
  console.error('✗ 添加功能映射失败:', error.message)
  process.exit(1)
} finally {
  db.close()
}
