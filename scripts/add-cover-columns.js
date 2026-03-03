/**
 * 添加封面相关列到数据库
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.sqlite');
const db = new Database(dbPath);

console.log('开始添加封面相关字段...');

try {
  db.exec('BEGIN TRANSACTION');

  // 为 posts 表添加封面字段
  console.log('添加 posts 表字段...');

  // 检查并添加 cover_image_url
  try {
    db.exec(`ALTER TABLE posts ADD COLUMN cover_image_url TEXT`);
    console.log('  ✓ 添加 cover_image_url');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - cover_image_url 已存在');
    } else {
      throw e;
    }
  }

  // 检查并添加 ai_cover_status
  try {
    db.exec(`ALTER TABLE posts ADD COLUMN ai_cover_status TEXT`);
    console.log('  ✓ 添加 ai_cover_status');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - ai_cover_status 已存在');
    } else {
      throw e;
    }
  }

  // 检查并添加 ai_cover_generated_at
  try {
    db.exec(`ALTER TABLE posts ADD COLUMN ai_cover_generated_at TEXT`);
    console.log('  ✓ 添加 ai_cover_generated_at');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - ai_cover_generated_at 已存在');
    } else {
      throw e;
    }
  }

  // 检查并添加 ai_cover_prompt
  try {
    db.exec(`ALTER TABLE posts ADD COLUMN ai_cover_prompt TEXT`);
    console.log('  ✓ 添加 ai_cover_prompt');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - ai_cover_prompt 已存在');
    } else {
      throw e;
    }
  }

  // 为 ai_model_configs 表添加 capability_type 字段
  console.log('添加 ai_model_configs 表字段...');
  try {
    db.exec(`ALTER TABLE ai_model_configs ADD COLUMN capability_type TEXT DEFAULT 'text'`);
    console.log('  ✓ 添加 capability_type');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - capability_type 已存在');
    } else {
      throw e;
    }
  }

  // 为 ai_call_logs 表添加图像字段
  console.log('添加 ai_call_logs 表字段...');
  try {
    db.exec(`ALTER TABLE ai_call_logs ADD COLUMN image_size TEXT`);
    console.log('  ✓ 添加 image_size');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - image_size 已存在');
    } else {
      throw e;
    }
  }

  try {
    db.exec(`ALTER TABLE ai_call_logs ADD COLUMN image_format TEXT`);
    console.log('  ✓ 添加 image_format');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - image_format 已存在');
    } else {
      throw e;
    }
  }

  try {
    db.exec(`ALTER TABLE ai_call_logs ADD COLUMN image_cost INTEGER`);
    console.log('  ✓ 添加 image_cost');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('  - image_cost 已存在');
    } else {
      throw e;
    }
  }

  db.exec('COMMIT');
  console.log('\n✓ 所有字段添加成功');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('\n✗ 添加失败:', error.message);
  console.error('详细错误:', error);
  process.exit(1);
} finally {
  db.close();
}
