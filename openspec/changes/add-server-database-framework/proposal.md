## Why

The current blog is a static Next.js application with no persistent data storage. To enable dynamic content management (blog posts, comments, tags, categories, etc.), we need a server-side backend with database capabilities. SQLite provides a lightweight, zero-configuration database solution ideal for personal blogs, while an ORM abstracts away raw SQL complexity.

## What Changes

- **Server-side framework integration**: Add API routes and server-side data handling capabilities
- **SQLite database**: Set up SQLite as the persistent storage layer
- **ORM integration**: Implement an ORM (Prisma or Drizzle) for type-safe database operations
- **Database connection management**: Establish connection pooling and lifecycle management
- **Migration system**: Set up database schema migration tooling

## Capabilities

### New Capabilities
- `database-framework`: Core database connectivity, ORM setup, and migration infrastructure
- `server-api`: Server-side API route handlers for CRUD operations

### Modified Capabilities
- *None* - This adds entirely new backend capabilities without modifying existing frontend behavior

## Impact

- **New dependencies**: Prisma ORM (or Drizzle ORM), SQLite driver
- **New directories**: `prisma/` (or `drizzle/`) for schema and migrations, API route handlers
- **Build process**: Update to include database migrations and client generation
- **Development workflow**: Add migration commands for schema changes
- **Type safety**: Generate TypeScript types from database schema
