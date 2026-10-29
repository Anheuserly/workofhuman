# WorkOfHuman — Engineering & Platform Documentation

Welcome to the official developer and operator documentation for **WorkOfHuman**.

WorkOfHuman is an independent creative platform designed to showcase and celebrate authentic human-crafted works and transparent AI-assisted experiments across 33 creative disciplines (visual arts, digital design, cinema, sound & music, literature, engineering, architecture, and emerging mediums).

---

## Documentation Index

| Document | Purpose & Contents |
| :--- | :--- |
| [**1. Architecture & Tech Stack**](./ARCHITECTURE.md) | High-level system design, Next.js 15 App Router, React 19, Server Components, styling framework, and directory layout. |
| [**2. Getting Started & Local Setup**](./GETTING_STARTED.md) | Prerequisites, environment variable configuration, dependency installation, database initialization, and local running. |
| [**3. Database Schema & Data Layer**](./DATABASE.md) | Comprehensive PostgreSQL schema breakdown: all 12 core tables, columns, indexes, JSONB fields, pooling, and seed scripts. |
| [**4. Routes & Page Specifications**](./ROUTES_AND_PAGES.md) | Exhaustive directory of all 13 platform routes, dynamic parameters (`/[username]`, `/categories/[slug]`, `/communities/[communityId]`), and rendering logic. |
| [**5. Creator Studio & AI Disclosure**](./CREATOR_STUDIO_AND_DISCLOSURE.md) | Publishing workflow, drag-and-drop media intake, 33 supported content categories, and transparent AI provenance standards. |
| [**6. Deployment & Operations**](./DEPLOYMENT_AND_OPERATIONS.md) | Deploying to Vercel, Node/Docker VPS deployment, PostgreSQL provisioning, connection pooling, and caching strategy. |
| [**7. Security & Role Management**](./SECURITY_AND_ROLES.md) | Authentication hooks, admin moderation guards, input sanitization, and SQL injection prevention. |

---

## Quick Reference

### Core Repository Structure

```text
workofhuman/
├── docs/                        # Complete technical & platform documentation
│   ├── README.md                # Documentation index (this file)
│   ├── ARCHITECTURE.md          # Architecture & technology overview
│   ├── GETTING_STARTED.md       # Setup & developer onboarding guide
│   ├── DATABASE.md              # Database DDL, entities & relationships
│   ├── ROUTES_AND_PAGES.md      # Page catalog & route handlers
│   ├── CREATOR_STUDIO_AND_DISCLOSURE.md # Publishing & AI transparency
│   ├── DEPLOYMENT_AND_OPERATIONS.md     # Production deployment & ops
│   └── SECURITY_AND_ROLES.md    # RBAC, security & data protection
├── scripts/
│   └── init-db.mjs              # PostgreSQL database creation and seed runner
├── src/
│   ├── app/                     # Next.js 15 App Router pages & layouts
│   │   ├── [username]/          # Creator profile & portfolio showcase
│   │   ├── admin/               # Administrative moderation & platform health
│   │   ├── ai/                  # Transparent AI creations directory
│   │   ├── categories/          # Category-specific creative feeds
│   │   ├── communities/         # Creative guilds & collective studios
│   │   ├── explore/             # Living atlas of all creative works
│   │   ├── marketplace/         # Creative licensing & commission listings
│   │   ├── messages/            # Direct creator inbox
│   │   ├── notifications/       # Platform activity & interaction feed
│   │   ├── settings/            # Account, profile, and studio preferences
│   │   ├── studio/              # Creation and upload studio
│   │   ├── trending/            # Real-time velocity & ranking showcase
│   │   ├── globals.css          # Tailwind CSS v4 design tokens & theme
│   │   ├── layout.tsx           # Root HTML layout, font setup, and body shell
│   │   └── page.tsx             # Dynamic editorial homepage
│   ├── components/              # Shared UI components (ProjectCard, PageShell, SiteHeader)
│   └── lib/
│       ├── db/                  # PostgreSQL pool (`index.ts`) & DDL (`schema.sql`)
│       ├── home-data.ts         # Data-fetching queries & entity types
│       ├── platform.ts          # Content taxonomy (33 types) & navigation
│       └── utils.ts             # Tailwind class merging (cn utility)
├── .env.example                 # Environment variable template
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and npm scripts
└── tsconfig.json                # TypeScript compiler configuration
```

### Key Commands

```bash
# Install dependencies
npm install

# Run database setup & seed
npm run db:init

# Launch local development server (http://localhost:3000)
npm run dev

# Compile production build
npm run build

# Start production server
npm start
```
