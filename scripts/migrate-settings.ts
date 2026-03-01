import Database from 'better-sqlite3'
import path from 'path'

const db = new Database('./data/db.sqlite')

// 启用外键约束
db.pragma('foreign_keys = ON')

console.log('Starting settings table migration...')

try {
  // 检查是否已经存在新表
  const newTableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='__new_settings'
  `).get()

  if (!newTableExists) {
    console.log('Creating new settings table...')
    // 创建新的 settings 表
    db.exec(`
      CREATE TABLE __new_settings (
        id text PRIMARY KEY NOT NULL,
        blog_name text DEFAULT 'My Blog' NOT NULL,
        blog_description text DEFAULT 'A personal blog' NOT NULL,
        posts_per_page integer DEFAULT 10 NOT NULL,
        author_name text DEFAULT 'Alex Chen' NOT NULL,
        author_avatar text DEFAULT 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede' NOT NULL,
        author_bio text DEFAULT 'Designer & Developer crafting digital experiences with code and creativity.' NOT NULL,
        author_location text DEFAULT 'San Francisco, CA' NOT NULL,
        author_zodiac text DEFAULT 'Scorpio \u266f' NOT NULL,
        author_email text DEFAULT 'alex@example.com' NOT NULL,
        author_social_github text DEFAULT 'github.com/alexchen',
        author_social_twitter text DEFAULT 'twitter.com/alexchen',
        author_social_linkedin text,
        updatedAt text DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)
  } else {
    console.log('New settings table already exists, skipping creation...')
  }

  // 检查旧表是否存在
  const oldTableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='settings'
  `).get()

  if (oldTableExists) {
    console.log('Migrating existing data...')
    // 迁移现有数据
    db.exec(`
      INSERT INTO __new_settings (id, blog_name, blog_description, posts_per_page, updatedAt)
      SELECT id, blog_name, blog_description, posts_per_page, updatedAt FROM settings
      WHERE NOT EXISTS (SELECT 1 FROM __new_settings WHERE __new_settings.id = settings.id);
    `)

    // 删除旧表
    console.log('Dropping old settings table...')
    db.exec(`DROP TABLE settings;`)
  } else {
    console.log('Old settings table not found, skipping...')
  }

  // 重命名新表
  console.log('Renaming new settings table...')
  db.exec(`ALTER TABLE __new_settings RENAME TO settings;`)

  // 验证表结构
  const columns = db.prepare(`PRAGMA table_info(settings)`).all()
  console.log('Settings table columns:', columns.map((c: any) => c.name))

  console.log('Settings table migration completed successfully!')
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
} finally {
  db.close()
}
