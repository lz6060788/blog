import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../server/db/schema'

const sqlite = new Database('./data/db.sqlite')
const db = drizzle(sqlite, { schema })

async function main() {
  console.log('Starting custom migration...')

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = OFF')

  // Create ai_model_configs table
  console.log('Creating ai_model_configs table...')
  await db.run(`
    CREATE TABLE IF NOT EXISTS ai_model_configs (
      id text PRIMARY KEY,
      name text NOT NULL,
      provider text NOT NULL,
      model text NOT NULL,
      api_key_encrypted text NOT NULL,
      base_url text,
      max_tokens integer DEFAULT 300 NOT NULL,
      temperature integer DEFAULT 7 NOT NULL,
      enabled integer DEFAULT 1 NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `)

  // Create ai_function_mappings table
  console.log('Creating ai_function_mappings table...')
  await db.run(`
    CREATE TABLE IF NOT EXISTS ai_function_mappings (
      id text PRIMARY KEY,
      function_name text NOT NULL,
      model_config_id text,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE SET NULL
    )
  `)

  await db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS ai_function_mappings_function_name_unique
    ON ai_function_mappings (function_name)
  `)

  // Create ai_call_logs table
  console.log('Creating ai_call_logs table...')
  await db.run(`
    CREATE TABLE IF NOT EXISTS ai_call_logs (
      id text PRIMARY KEY,
      post_id text,
      model_config_id text,
      action text NOT NULL,
      provider text,
      model text,
      input_tokens integer,
      output_tokens integer,
      status text NOT NULL,
      error_message text,
      duration_ms integer,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
      FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE SET NULL
    )
  `)

  // Add AI summary columns to posts table
  console.log('Adding AI summary columns to posts table...')

  // Check if columns exist first
  const tableInfo = await db.all("PRAGMA table_info(posts)")
  const hasAiSummary = tableInfo.some((col: any) => col.name === 'ai_summary')

  if (!hasAiSummary) {
    await db.run('ALTER TABLE posts ADD COLUMN ai_summary text')
    console.log('  - Added ai_summary column')
  }

  const hasAiSummaryGeneratedAt = tableInfo.some((col: any) => col.name === 'ai_summary_generated_at')
  if (!hasAiSummaryGeneratedAt) {
    await db.run('ALTER TABLE posts ADD COLUMN ai_summary_generated_at text')
    console.log('  - Added ai_summary_generated_at column')
  }

  const hasAiSummaryStatus = tableInfo.some((col: any) => col.name === 'ai_summary_status')
  if (!hasAiSummaryStatus) {
    await db.run('ALTER TABLE posts ADD COLUMN ai_summary_status text')
    console.log('  - Added ai_summary_status column')
  }

  await db.run('PRAGMA foreign_keys = ON')

  // Insert initial function mappings
  console.log('Inserting initial function mappings...')

  const existingMappings = await db.select().from(schema.aiFunctionMappings)
  if (existingMappings.length === 0) {
    const crypto = require('crypto')
    const id1 = crypto.randomBytes(16).toString('hex')
    const id2 = crypto.randomBytes(16).toString('hex')
    const id3 = crypto.randomBytes(16).toString('hex')

    await db.insert(schema.aiFunctionMappings).values([
      { id: id1, functionName: 'summary', modelConfigId: null },
      { id: id2, functionName: 'cover', modelConfigId: null },
      { id: id3, functionName: 'search', modelConfigId: null },
    ])
    console.log('  - Inserted default function mappings (summary, cover, search)')
  }

  console.log('Migration completed successfully!')
}

main().catch(console.error)
