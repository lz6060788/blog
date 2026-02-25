## Context

The blog is currently a static Next.js 14 application using the App Router pattern with TypeScript. It has internationalization support (next-intl) and a theme system but lacks any persistent data layer. All content is currently static.

Constraints:
- Must integrate seamlessly with Next.js App Router
- SQLite as the database (file-based, zero-config)
- TypeScript-first approach
- Keep setup simple for a personal blog scale

## Goals / Non-Goals

**Goals:**
- Establish a reusable database layer with connection management
- Set up ORM for type-safe database queries
- Create migration system for schema evolution
- Define API route patterns for CRUD operations
- Enable future features (posts, comments, tags, etc.)

**Non-Goals:**
- Defining actual table schemas (will be done in future changes)
- Authentication/authorization system
- Caching layer or query optimization
- Database replication or backup strategies

## Decisions

### ORM: Drizzle ORM over Prisma

**Rationale:**
- **Lightweight**: Drizzle has no binary generation step; Prisma requires `prisma generate`
- **SQLite native**: Drizzle's `better-sqlite3` driver is more performant for SQLite
- **SQL-like syntax**: Drizzle's query builder feels closer to SQL, making it easier to debug
- **Bundle size**: Drizzle is significantly smaller (~50KB vs Prisma's ~200KB)
- **Next.js App Router friendly**: No edge compatibility issues
- **TypeScript inference**: Better type inference from queries

**Alternative considered**: Prisma - mature ecosystem, excellent migrations, but heavier and the generate step adds complexity to the build.

### Database Directory: `./data/db.sqlite`

**Rationale:**
- Keeps database file in project root (gitignored)
- Separate from code but easily accessible
- Common convention for SQLite projects

### API Route Pattern: App Router (`/app/api/`)

**Rationale:**
- Next.js 14 uses App Router by default
- Route Handlers (`route.ts`) support all HTTP methods
- Can be collocated with app structure if needed (e.g., `/app/api/posts/route.ts`)

### Connection Management: Singleton pattern with lib file

**Rationale:**
- Single db instance reused across requests (SQLite handles this well)
- Centralized `lib/db.ts` for database access
- Easy to mock for testing

### Migration Tool: Drizzle Kit

**Rationale:**
- Built specifically for Drizzle ORM
- Generates migrations from schema changes
- Supports both push (dev) and migrate (prod) workflows

## Risks / Trade-offs

**Risk: SQLite concurrency limits** → SQLite uses file-level locking. For a personal blog this is acceptable (single writer, multiple readers). If high concurrency is needed later, can migrate to PostgreSQL.

**Risk: Migration complexity grows** → Keep schema changes small and additive. Use Drizzle's migrate strategy in production.

**Trade-off: No connection pooling** → SQLite doesn't need traditional connection pooling. Singleton pattern is sufficient.

**Risk: Edge runtime incompatibility** → `better-sqlite3` only works in Node.js runtime. API routes must use Node.js runtime, not Edge.

## Open Questions

None - framework-level decisions are straightforward. Schema decisions will be made in follow-up changes.
