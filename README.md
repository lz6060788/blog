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

## Authentication

This project uses NextAuth.js v5 for user authentication with OAuth providers (GitHub and Google).

### Setup

1. **Install dependencies** (already done):
   ```bash
   npm install next-auth@beta @auth/drizzle-adapter
   ```

2. **Configure environment variables** in `.env.local`:
   ```bash
   # Generate with: openssl rand -base64 32
   AUTH_SECRET=your-auth-secret-here

   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Run database migrations** to create auth tables:
   ```bash
   npm run db:push
   ```

### Creating OAuth Apps

**GitHub OAuth App:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

**Google OAuth 2.0:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env.local`

### Using Authentication

**In Server Components:**
```typescript
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

**In Client Components:**
```typescript
"use client";

import { useSession } from "next-auth/react";

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Please sign in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

**In API Routes:**
```typescript
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/middleware-auth";

export async function GET() {
  // Option 1: Manual check
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Option 2: Using helper
  const session2 = await requireAuth(); // Throws if not authenticated

  return NextResponse.json({ user: session.user });
}
```

### Account Linking

When users sign in with different OAuth providers but the same email, the system automatically links the accounts to a single user profile. For example:
- User signs in with GitHub (email: user@example.com) → Creates user A
- User signs in with Google (email: user@example.com) → Links to user A

Both login methods will now access the same account.

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
