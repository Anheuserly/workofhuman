# Architecture & Technology Stack

This document details the architectural principles, component models, and data flows powering **WorkOfHuman**.

---

## 1. High-Level Architecture Overview

WorkOfHuman is built on modern web standards prioritizing:
1. **Server-Side Rendering (SSR) & Server Components**: Instant page loading, minimal client JavaScript footprint, and high SEO visibility for creator portfolios.
2. **Direct Relational Persistence**: Direct query layer over PostgreSQL without heavy ORM overhead, ensuring maximum database query speed and flexibility.
3. **Transparent AI Metadata Integration**: Explicit data schema support for recording model provenance, generation tags, and creative process disclosures.
4. **Refined Editorial UI**: A distraction-free canvas powered by Tailwind CSS v4 and subtle micro-interactions with Framer Motion.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Next.js Client Runtime: Navigation, Uploads, Reactions)  │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 15 Server Runtime                   │
│                                                             │
│  ┌────────────────────────┐      ┌───────────────────────┐  │
│  │   App Router (SSR)     │      │   Server Utilities    │  │
│  │  - Editorial Homepage  │◄────►│  - lib/home-data.ts   │  │
│  │  - Creator Profiles    │      │  - lib/platform.ts    │  │
│  │  - Category Feeds      │      │  - lib/db/index.ts    │  │
│  └────────────────────────┘      └───────────▲───────────┘  │
└──────────────────────────────────────────────┼──────────────┘
                                               │ TCP Connection Pool
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database Engine                 │
│                      (schema: workofhuman)                  │
│                                                             │
│  - homepage_settings   - projects          - interactions   │
│  - profiles            - comments          - follows        │
│  - communities         - trending_cache    - marketplace    │
│  - messages            - notifications     - members        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Breakdown

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js App Router | `15.5.x` | Routing, Server Components, SSR, layout streaming, and asset bundling. |
| **Runtime / UI** | React & React DOM | `19.2.x` | Modern React 19 primitives with Server Actions and concurrent rendering. |
| **Language** | TypeScript | `5.x` | Strict type definitions across models, database responses, and component props. |
| **Database** | PostgreSQL | `14+` | Production ACID-compliant storage via `pg` connection pool. |
| **Styling** | Tailwind CSS | `v4` | Modern CSS-first utility classes, zero-runtime overhead, container queries. |
| **Animations** | Framer Motion | `12.x` | Fluid transitions, hero layout transitions, and interactive controls. |
| **Headless UI** | Radix UI | Latest | Accessible unstyled primitives (Dialog, Tabs, Popover, Dropdown, Tooltip). |
| **Form & Validation** | React Hook Form & Zod | `7.x` / `4.x` | Type-safe form validation, metadata schemas, and submission handling. |
| **Query State** | TanStack Query | `v5` | Client-side reactive cache management and optimistic mutation handling. |
| **URL State** | Nuqs | `2.8.x` | Type-safe URL query-string state synchronization for filters and search. |

---

## 3. Server Components vs. Client Components

WorkOfHuman adopts a **Server-First** component strategy:

### Server Components (Default)
All route entries in `src/app/` are React Server Components (`page.tsx`, `layout.tsx`):
- Fetch data directly from PostgreSQL using `lib/home-data.ts`.
- Generate static HTML on the server with zero client bundle impact.
- Avoid client-side data waterfalls or loading spinners on initial load.
- Secure environment secrets (such as database credentials) completely on the backend.

### Client Components (`"use client"`)
Client components are strictly reserved for interactive boundaries:
- Interactive modals (Radix Dialogs).
- Drag-and-drop file upload zones in `/studio/upload`.
- Like, save, and bookmark buttons with optimistic feedback.
- Tabs and filter dropdowns.

---

## 4. Data Layer & Search Path Routing

The PostgreSQL database abstraction lives in `src/lib/db/index.ts`:

```typescript
// Automatic schema resolution
pool.on("connect", (client: PoolClient) => {
  client.query("SET search_path TO workofhuman, public;").catch(() => {});
});
```

- When any query references an unqualified table (e.g., `SELECT * FROM projects`), PostgreSQL automatically resolves it to `workofhuman.projects`.
- This ensures clean namespacing and prevents collision with tables in other schemas on shared PostgreSQL instances.
- Connections are pooled with a default limit of 10 concurrent connections and automatic idle timeouts.

---

## 5. Directory Layout & Organization

```
src/
├── app/                  # Application routing, layout trees, and global CSS
├── components/           # Reusable presentational & layout components
│   ├── project-card.tsx  # Universal project display tile with creator & AI badges
│   └── shell.tsx         # PageShell, SectionIntro, SiteHeader, EmptyState
└── lib/                  # Business logic, entity interfaces, and database drivers
    ├── db/               # PostgreSQL pool connection and DDL schema
    ├── home-data.ts      # Query methods for homepage, profiles, categories, explore
    ├── platform.ts       # 33 content category definitions, navigation menus
    └── utils.ts          # Tailwind class merger (clsx + tailwind-merge)
```
