# WorkOfHuman

**Independent Creative Expression Across Every Discipline.**

WorkOfHuman is a modern **Next.js 15** creative platform built to celebrate and elevate serious creative work across 33 creative mediums — honoring authentic human craft and transparently cataloging AI-assisted experiments.

Powered by **PostgreSQL**, **React 19 Server Components**, **Tailwind CSS v4**, and **Framer Motion**.

---

## 📚 Complete Documentation Suite

Comprehensive technical, operational, and architectural documentation is maintained in the [`docs/`](./docs) directory:

- 🏗️ [**Architecture & Tech Stack**](./docs/ARCHITECTURE.md) — System design, Server Components, client boundaries, and state management.
- 🚀 [**Getting Started & Local Setup**](./docs/GETTING_STARTED.md) — Step-by-step installation, environment variables, and troubleshooting.
- 🗄️ [**PostgreSQL Database Schema**](./docs/DATABASE.md) — All 12 tables, indexes, constraints, JSONB schemas, and pooling rules.
- 🗺️ [**Routes & Page Specifications**](./docs/ROUTES_AND_PAGES.md) — Complete guide to all 13 routes and dynamic parameters (`/[username]`, `/categories/[slug]`, `/communities/[communityId]`).
- 🎨 [**Creator Studio & Transparent AI Disclosure**](./docs/CREATOR_STUDIO_AND_DISCLOSURE.md) — Multi-medium upload workflow, 33 supported disciplines, and provenance tags.
- 🚢 [**Deployment & Operations**](./docs/DEPLOYMENT_AND_OPERATIONS.md) — Production setup for Vercel, Linux VPS (PM2/Nginx), and database backups.
- 🛡️ [**Security & Role Management**](./docs/SECURITY_AND_ROLES.md) — Role-based access control, SQL injection prevention, and Zod validation.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js `20+` or `22+`
- PostgreSQL `14+`

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your PostgreSQL connection string:
```bash
DATABASE_URL="postgresql://postgres:password@host:5432/workofhuman"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install & Initialize
```bash
# Install dependencies
npm install

# Create workofhuman schema, 12 tables, indexes, and initial seed
npm run db:init
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Server Components)
- **Runtime**: React 19 & React DOM 19
- **Database**: PostgreSQL 14+ via `pg` connection pool with schema isolation
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons
- **Headless UI & State**: Radix UI primitives, React Hook Form, Zod, TanStack Query, Nuqs
- **Language**: TypeScript 5 (Strict Mode)

---

## 🗺️ Key Platform Routes

| Route | Purpose |
| :--- | :--- |
| [`/`](./src/app/page.tsx) | Dynamic editorial homepage with hero media showcase. |
| [`/[username]`](./src/app/[username]/page.tsx) | Verified creator portfolio and published works archive. |
| [`/explore`](./src/app/explore/page.tsx) | Universal creative atlas of all published projects. |
| [`/trending`](./src/app/trending/page.tsx) | Real-time velocity-ranked creations across all mediums. |
| [`/ai`](./src/app/ai/page.tsx) | Transparent AI creation showcase with model disclosures. |
| [`/categories/[slug]`](./src/app/categories/[slug]/page.tsx) | Medium-specific feeds (e.g. `architecture`, `digital_art`, `music`). |
| [`/communities`](./src/app/communities/page.tsx) | Creative guilds, collectives, and collaborative studios. |
| [`/marketplace`](./src/app/marketplace/page.tsx) | Digital licensing, commissions, and project assets. |
| [`/studio/upload`](./src/app/studio/upload/page.tsx) | Multi-medium creator upload flow with AI disclosure. |
| [`/messages`](./src/app/messages/page.tsx) | Direct creator inquiries and collaboration threads. |
| [`/notifications`](./src/app/notifications/page.tsx) | Interaction activity feed (likes, bookmarks, follows). |
| [`/settings`](./src/app/settings/page.tsx) | Account control room and studio preferences. |
| [`/admin`](./src/app/admin/page.tsx) | Platform health, moderation queues, and editorial picks. |

---

## 🏛️ Database Architecture (`workofhuman` schema)

All data is structured inside the `workofhuman` schema across 12 relational entities:
- `homepage_settings` — Dynamic hero copywriting & CTAs.
- `profiles` — Creator identities, portfolios, and verification badges.
- `projects` — Creative works across 33 categories with AI disclosure.
- `interactions` — Deduplicated likes, saves, and views.
- `comments` — Threaded peer reviews and critique.
- `follows` — Follower/following network graph.
- `trending_cache` — Precomputed velocity ranking scores.
- `communities` & `community_members` — Creative collectives & memberships.
- `marketplace_listings` — Licensing, physical, and digital listings.
- `messages` — Direct peer communication.
- `notifications` — Signal alerts and platform events.

For full schema details and DDL, see [**docs/DATABASE.md**](./docs/DATABASE.md).
