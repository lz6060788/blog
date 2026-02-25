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
- **Styling**: Tailwind CSS v3
- **Animation**: Framer Motion
- **Icons**: Phosphor Icons
- **Fonts**: Outfit & JetBrains Mono

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
