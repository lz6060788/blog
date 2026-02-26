const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.sqlite');
const db = new Database(dbPath);

// Create posts table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    authorId TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

try {
  db.exec(createTableSQL);
  console.log('Posts table created successfully!');
} catch (error) {
  console.error('Error creating posts table:', error);
} finally {
  db.close();
}
