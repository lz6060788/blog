# Personal Blog

A minimalist personal blog with asymmetric design, built with Next.js, Tailwind CSS, and Framer Motion.

## Design Philosophy

- **Design Variance (8/10)**: Asymmetric layouts with intentional imbalance
- **Motion Intensity (6/10)**: Fluid animations with spring physics
- **Visual Density (4/10)**: Clean, airy presentation with generous whitespace

## Features

- **Homepage**: Split-screen layout with timeline-style article list
- **Archive**: Yearly grouped post archive with bento grid
- **Post Detail**: Clean reading experience with minimal distractions
- **Animations**: Staggered reveals, magnetic hover effects, spring physics

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm dev

# Build for production
npm build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 14 (React Server Components)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS v3
- **Animation**: Framer Motion
- **Icons**: Phosphor Icons
- **Fonts**: Outfit & JetBrains Mono

## Database

This project uses SQLite with Drizzle ORM for data persistence.

### Setup

The database file is automatically created at `./data/db.sqlite` on first run.

### Migration Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly (development only)
npm run db:push
```

### Schema Definitions

Database tables are defined in `lib/db/schema.ts` using Drizzle ORM schema builders. TypeScript types are automatically inferred from the schema.

## API Routes

API routes follow Next.js App Router pattern under `/app/api/`.

### Route Structure

```
app/
└── api/
    ├── health/
    │   └── route.ts       # Health check endpoint
    └── [resource]/
        └── route.ts       # CRUD endpoints for resources
```

### Creating New API Routes

1. Create a new directory under `app/api/`:
   ```bash
   mkdir -p app/api/posts
   ```

2. Create `route.ts` with HTTP method handlers:
   ```typescript
   import { NextResponse } from "next/server";
   import { db } from "@/lib/db";

   // Required for SQLite (better-sqlite3 only works in Node.js)
   export const runtime = "nodejs";

   export async function GET() {
     const items = await db.select().from(schema.yourTable);
     return NextResponse.json(items);
   }

   export async function POST(request: Request) {
     const body = await request.json();
     const item = await db.insert(schema.yourTable).values(body).returning();
     return NextResponse.json(item, { status: 201 });
   }
   ```

### Important Notes

- **Runtime**: All API routes using the database must export `export const runtime = "nodejs"` because `better-sqlite3` only works in Node.js runtime (not Edge)
- **Database Access**: Import the database client from `@/lib/db`
- **Type Safety**: TypeScript types are automatically inferred from your Drizzle schema

## Project Structure

```
├── app/
│   ├── archive/
│   │   └── page.tsx          # Archive page
│   ├── post/
│   │   └── [id]/
│   │       └── page.tsx      # Post detail page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/
│   ├── Navigation.tsx        # Site navigation
│   ├── AuthorCard.tsx        # Author profile card
│   ├── TimelineList.tsx      # Timeline article list
│   └── ArchiveGrid.tsx       # Archive grid layout
└── lib/
    ├── types.ts              # TypeScript types
    └── data.ts               # Mock data
```

## Customization

### Author Info

Edit `lib/data.ts` to customize the author information:

```typescript
export const author: Author = {
  name: 'Your Name',
  avatar: 'your-avatar-url',
  bio: 'Your bio...',
  location: 'Your location',
  zodiac: 'Your zodiac sign',
  // ... more fields
}
```

### Posts

Add or modify posts in `lib/data.ts`:

```typescript
export const posts: Post[] = [
  {
    id: '1',
    title: 'Your Post Title',
    excerpt: 'Post excerpt...',
    content: 'Full post content...',
    date: '2024-11-15',
    readTime: 5,
    category: 'Design',
    tags: ['tag1', 'tag2'],
  },
  // ... more posts
]
```

### Color Scheme

The blog uses a Zinc neutral palette with Emerald accent. To customize, edit `tailwind.config.ts`:

```typescript
colors: {
  zinc: { /* your colors */ },
  emerald: { /* your accent color */ },
}
```

## License

MIT
