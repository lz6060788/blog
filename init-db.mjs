import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import Database from 'better-sqlite3';

const dbFile = process.env.DATABASE_FILE ?? './data/db.sqlite';
const dbDir = path.dirname(dbFile);

fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbFile);
db.pragma('foreign_keys = ON');

const hasPostsTable = Boolean(
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'").get(),
);

if (!hasPostsTable) {
  console.log(`[db-init] bootstrap schema via drizzle push: ${dbFile}`);
  execSync('npx drizzle-kit push --force', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_FILE: dbFile },
  });
}

const now = new Date().toISOString();
const settingsTableExists = Boolean(
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get(),
);

if (settingsTableExists) {
  const settingsExists = db.prepare("SELECT 1 FROM settings WHERE id='default'").get();
  if (!settingsExists) {
    db.prepare('INSERT INTO settings (id, updatedAt) VALUES (?, ?)').run('default', now);
    console.log('[db-init] inserted default settings row');
  }
}

db.close();
console.log(`[db-init] database is ready at ${dbFile}`);
