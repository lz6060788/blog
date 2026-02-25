import { Author, Post } from './types'

export const author: Author = {
  name: 'Alex Chen',
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede',
  bio: 'Designer & Developer crafting digital experiences with code and creativity.',
  location: 'San Francisco, CA',
  zodiac: 'Scorpio ♏',
  email: 'alex@example.com',
  social: {
    github: 'github.com/alexchen',
    twitter: 'twitter.com/alexchen',
  },
}

export const posts: Post[] = [
  {
    id: '1',
    title: 'The Art of Asymmetric Design',
    excerpt: 'Exploring how breaking symmetry creates visual tension and guides user attention in modern web interfaces.',
    content: `# The Art of Asymmetric Design

Symmetry has long been considered a fundamental principle of good design. But in the digital age, breaking symmetry has become a powerful tool for creating memorable experiences.

## Why Asymmetry Works

When we encounter perfectly symmetrical layouts, our brains quickly categorize them as "safe" and "predictable." Asymmetric designs, on the other hand, create visual tension that engages the viewer's attention.

## Practical Applications

- **Split-screen layouts**: Dividing content unevenly creates hierarchy
- **Offset grids**: Breaking the grid adds visual interest
- **Negative space**: Strategic emptiness guides the eye

## Conclusion

Asymmetric design isn't about chaos—it's about intentional imbalance that serves a purpose.`,
    date: '2024-11-15',
    readTime: 5,
    category: 'Design',
    tags: ['UI/UX', 'Layout', 'Visual Design'],
  },
  {
    id: '2',
    title: 'Understanding React Server Components',
    excerpt: 'A deep dive into the paradigm shift that\'s changing how we build React applications.',
    content: `# Understanding React Server Components

React Server Components (RSC) represent one of the most significant shifts in React development since hooks were introduced.

## The Core Concept

RSC allows components to run exclusively on the server, sending only the rendered HTML to the client. This means:

- Zero bundle size for server-only code
- Direct access to backend resources
- Reduced client-side JavaScript

## Mental Model

Think of RSC as having two types of components:
1. **Server Components**: Default, run on server, no interactivity
2. **Client Components**: Marked with "use client", run in browser

## When to Use Each

Use Server Components for:
- Data fetching
- Heavy computations
- Secure operations

Use Client Components for:
- Event handlers
- Browser APIs
- State management`,
    date: '2024-11-08',
    readTime: 8,
    category: 'Development',
    tags: ['React', 'Next.js', 'Web Development'],
  },
  {
    id: '3',
    title: 'Micro-Interactions That Matter',
    excerpt: 'Small details that transform good interfaces into great ones through tactile feedback.',
    content: `# Micro-Interactions That Matter

The difference between a good interface and a great one often comes down to micro-interactions—those tiny moments of feedback that acknowledge user actions.

## The Physics of Digital Interaction

Great interfaces feel physical. When you press a button, it should respond like a physical object would:

- **Compression**: Slight scale reduction on press
- **Elasticity**: Spring-based return animations
- **Magnetism**: Elements that pull toward cursor

## Real-World Examples

1. **Pull-to-refresh**: The tension builds as you drag
2. **Swipe actions**: Cards that follow your finger
3. **Loading states**: Skeleton screens that match content

## Implementation Tips

- Use spring physics instead of linear easing
- Keep animations under 300ms for UI feedback
- Provide immediate acknowledgment for all user input`,
    date: '2024-10-28',
    readTime: 4,
    category: 'Design',
    tags: ['Animation', 'UI/UX', 'Interaction Design'],
  },
  {
    id: '4',
    title: 'CSS Grid vs Flexbox: When to Use What',
    excerpt: 'A practical guide to choosing between CSS Grid and Flexbox for layout challenges.',
    content: `# CSS Grid vs Flexbox: When to Use What

Both CSS Grid and Flexbox are powerful layout tools, but they solve different problems. Understanding when to use each is key to writing clean, maintainable CSS.

## Flexbox: One-Dimensional Layout

Flexbox excels at:
- Distributing space along a single axis
- Aligning items in a row or column
- Handling flexible sizing within containers

\`\`\`css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

## CSS Grid: Two-Dimensional Layout

Grid shines when:
- You need to control rows AND columns
- Creating complex asymmetric layouts
- Overlapping elements is required

\`\`\`css
.bento-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
}
\`\`\`

## The Decision Framework

- **One dimension?** Use Flexbox
- **Two dimensions?** Use Grid
- **Component layout?** Flexbox usually
- **Page layout?** Grid usually`,
    date: '2024-10-15',
    readTime: 6,
    category: 'Development',
    tags: ['CSS', 'Layout', 'Frontend'],
  },
  {
    id: '5',
    title: 'The Return of Brutalism in Web Design',
    excerpt: 'How raw, unpolished aesthetics are making a comeback as a reaction against cookie-cutter designs.',
    content: `# The Return of Brutalism in Web Design

After years of polished, homogeneous designs, brutalism is experiencing a renaissance. But what exactly is brutalist web design?

## What is Brutalism?

Brutalism in web design is characterized by:
- Raw, unpolished aesthetics
- Intentional "ugliness" as a statement
- Exposed structure and functionality
- Rejection of mainstream design trends

## Why Now?

The resurgence of brutalism is a reaction against:
- Template-based design systems
- AI-generated homogeneous content
- The "SaaS aesthetic" sameness

## Key Principles

1. **Honesty**: Show how things work
2. **Rawness**: Embrace imperfection
3. **Function**: Form follows function
4. **Personality**: Stand out, don't blend in

## Implementation

- Use system fonts
- Show borders and structure
- Embrace default HTML elements
- Avoid excessive shadows and gradients`,
    date: '2024-09-30',
    readTime: 7,
    category: 'Design',
    tags: ['Design Trends', 'Brutalism', 'Web Design'],
  },
]
