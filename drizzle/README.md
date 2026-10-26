# Drizzle Migrations (PostgreSQL)

Legacy SQLite migration files were intentionally removed as part of the reset-style PostgreSQL migration.

Use the following flow for new migrations:

1. Set `DATABASE_URL` to the intended PostgreSQL database; treat a shared instance as production.
2. Run `npx tsx scripts/backup-database.ts`, confirm `verified: true`, and retain the backup path and SHA-256 outside Git.
3. For schema changes, run `npm run db:generate`; do not regenerate already reviewed migrations merely to apply them.
4. Review the pending SQL and verify the existing migration journal. Applying changes to a shared database requires explicit authorization.
5. Apply with `npm run db:migrate`, then verify the journal, new schema objects, and existing data.

Local UI previews must use an independent, read-only database. Do not run shared-database migrations as a preview setup step.
