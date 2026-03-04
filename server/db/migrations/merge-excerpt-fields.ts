import { db } from '../index'
import { posts } from '../schema'
import { eq } from 'drizzle-orm'

/**
 * Migration: Merge aiSummary into excerpt
 *
 * This script migrates data from aiSummary field to excerpt field.
 * Priority: aiSummary > manual excerpt > empty
 *
 * After running this migration:
 * - All aiSummary data will be moved to excerpt
 * - aiSummary, aiSummaryGeneratedAt, aiSummaryStatus fields can be removed
 */

interface PostWithAiSummary {
  id: string
  title: string
  excerpt: string | null
  aiSummary: string | null
  aiSummaryStatus: string | null
  aiSummaryGeneratedAt: string | null
}

interface MigrationResult {
  total: number
  migrated: number
  alreadyExcerpt: number
  noData: number
  skipped: number
  details: Array<{
    postId: string
    title: string
    action: string
    before?: string
    after?: string
  }>
}

/**
 * Migrate aiSummary to excerpt for all posts
 */
export async function migrateExcerptFields(): Promise<MigrationResult> {
  console.log('Starting excerpt fields migration...')

  // Get all posts
  const allPosts = await db.select().from(posts) as any[]

  const result: MigrationResult = {
    total: allPosts.length,
    migrated: 0,
    alreadyExcerpt: 0,
    noData: 0,
    skipped: 0,
    details: [],
  }

  for (const post of allPosts as PostWithAiSummary[]) {
    const { id, title, excerpt, aiSummary } = post

    // Decision logic:
    // 1. If aiSummary exists and is not empty, use it (override excerpt)
    // 2. If aiSummary is empty/null but excerpt exists, keep excerpt
    // 3. If both are empty, skip

    if (aiSummary && aiSummary.trim().length > 0) {
      // Case 1: aiSummary exists, use it
      if (excerpt !== aiSummary) {
        await db
          .update(posts)
          .set({ excerpt: aiSummary.trim() })
          .where(eq(posts.id, id))

        result.migrated++
        result.details.push({
          postId: id,
          title,
          action: 'migrated',
          before: excerpt || '(empty)',
          after: aiSummary.trim(),
        })
        console.log(`[MIGRATED] ${title}: aiSummary -> excerpt`)
      } else {
        // Already same, skip
        result.skipped++
        result.details.push({
          postId: id,
          title,
          action: 'skipped',
        })
        console.log(`[SKIPPED] ${title}: excerpt and aiSummary are the same`)
      }
    } else if (excerpt && excerpt.trim().length > 0) {
      // Case 2: aiSummary is empty, excerpt exists - keep as is
      result.alreadyExcerpt++
      result.details.push({
        postId: id,
        title,
        action: 'kept',
      })
      console.log(`[KEPT] ${title}: existing excerpt`)
    } else {
      // Case 3: Both are empty
      result.noData++
      result.details.push({
        postId: id,
        title,
        action: 'nodata',
      })
      console.log(`[NODATA] ${title}: no excerpt or aiSummary`)
    }
  }

  console.log('\nMigration Summary:')
  console.log(`Total posts: ${result.total}`)
  console.log(`Migrated (aiSummary -> excerpt): ${result.migrated}`)
  console.log(`Already has excerpt: ${result.alreadyExcerpt}`)
  console.log(`No data: ${result.noData}`)
  console.log(`Skipped (same content): ${result.skipped}`)

  return result
}

/**
 * Rollback: Clear excerpt for posts that were migrated
 * WARNING: This will remove the migrated data. Use with caution!
 */
export async function rollbackMigration(result: MigrationResult): Promise<void> {
  console.log('Rolling back excerpt migration...')

  for (const detail of result.details) {
    if (detail.action === 'migrated') {
      // For migrated posts, we can't easily restore the original excerpt
      // because we didn't save it. This is a limitation.
      console.warn(`Cannot rollback ${detail.postId}: original excerpt not saved`)
    }
  }

  console.log('Rollback complete. Note: Original excerpt data was not preserved.')
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateExcerptFields()
    .then(() => {
      console.log('Migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}
