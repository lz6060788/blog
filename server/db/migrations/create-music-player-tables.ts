import Database from 'better-sqlite3'

/**
 * Migration: Create music player tables
 *
 * Creates the following tables:
 * - songs: Stores music track information
 * - playlists: Stores playlist information
 * - playlist_songs: Many-to-many relationship between playlists and songs
 */

export async function createMusicPlayerTables(): Promise<void> {
  console.log('Creating music player tables...')

  const sqlite = new Database('./data/db.sqlite')
  sqlite.pragma('foreign_keys = ON')

  try {
    // Create songs table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT,
        duration INTEGER NOT NULL,
        audio_url TEXT NOT NULL,
        lyrics TEXT,
        file_size INTEGER,
        file_format TEXT,
        upload_status TEXT DEFAULT 'pending' NOT NULL,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `)
    console.log('✓ Created songs table')

    // Create playlists table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        cover_color TEXT DEFAULT '#6366f1' NOT NULL,
        is_public INTEGER DEFAULT 0 NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `)
    console.log('✓ Created playlists table')

    // Create playlist_songs table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        id TEXT PRIMARY KEY NOT NULL,
        playlist_id TEXT NOT NULL,
        song_id TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
        UNIQUE(playlist_id, song_id)
      )
    `)
    console.log('✓ Created playlist_songs table')

    console.log('\n✓ Music player tables created successfully!')
  } catch (error) {
    console.error('Failed to create music player tables:', error)
    throw error
  } finally {
    sqlite.close()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createMusicPlayerTables()
    .then(() => {
      console.log('Migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}
