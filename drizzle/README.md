# Drizzle Migrations (PostgreSQL)

Legacy SQLite migration files were intentionally removed as part of the reset-style PostgreSQL migration.

Use the following flow for new migrations:

1. Set `DATABASE_URL` to your PostgreSQL database.
2. Run `npm run db:generate`.
3. Review generated SQL files in this directory.
4. Apply with `npm run db:migrate`.
