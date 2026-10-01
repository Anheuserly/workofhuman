# WorkOfHuman

WorkOfHuman is a modern Next.js 15 creative expression platform designed to celebrate and elevate both human-crafted and transparent AI-assisted work across every creative discipline (visual art, design, engineering, music, architecture, cinema, and literature).

Powered by **PostgreSQL** and Next.js App Router with Server Components.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, SSR)
- **Database**: PostgreSQL (`pg` connection pool with automatic schema fallback)
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons
- **State & UI**: Radix UI primitives, React Hook Form, Zod

---

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` (or `.env.local`) based on `.env.example`:

```bash
DATABASE_URL=postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman
NEXT_PUBLIC_APP_URL=https://workofhuman.com
```

### 3. Initialize & Seed Database

Run the database setup script to create the schema, tables, indexes, and starter seed data:

```bash
npm run db:init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Architecture

The platform runs on PostgreSQL with the following core entities:

- `homepage_settings` — Dynamic hero copywriting and navigation CTAs.
- `profiles` — Creator profiles, credentials, disciplines, and social links.
- `projects` — Creative showcase items, media galleries, transparency disclosures, and stats.
- `interactions` — Creator appreciates, bookmarks, and views.
- `comments` — Peer reviews, creative critique, and threaded discussion.
- `follows` — Creator network graph.
- `trending_cache` — Pre-aggregated velocity and ranking scores.
- `communities` — Creative guilds, circles, and disciplinary collectives.
- `community_members` — Membership roles and permissions.
- `marketplace_listings` — Commissions, project licensing, and physical/digital works.
- `messages` — Direct creator communications and collaborations.
- `notifications` — Platform activity feed and interaction alerts.
