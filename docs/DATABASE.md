# PostgreSQL Database Schema & Data Layer

This document is the definitive guide to the **WorkOfHuman** PostgreSQL database architecture, table definitions, relationships, indexes, and querying conventions.

---

## 1. Overview & Connection Architecture

- **Database Engine**: PostgreSQL 14+
- **Dedicated Schema**: `workofhuman`
- **Default Port**: `5432`
- **Driver**: Node `pg` (Pool client)

### Connection Pooling (`src/lib/db/index.ts`)

The database connection pool is configured as a persistent singleton:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 6000,
});
```

Every new connection automatically executes:
```sql
SET search_path TO workofhuman, public;
```
This enables queries across application code to address tables directly without prefixing `workofhuman.` (e.g. `SELECT * FROM projects` resolves to `workofhuman.projects`).

---

## 2. Table Specifications

### 2.1 `homepage_settings`
Stores dynamic homepage headline copy, call-to-action buttons, and footer descriptions editable by platform administrators.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY`, Default `'default'` | Setting profile identifier. |
| `eyebrow` | `TEXT` | `NOT NULL` | Small badge pill above hero headline. |
| `heading` | `TEXT` | `NOT NULL` | Primary high-impact hero headline. |
| `subheading` | `TEXT` | `NOT NULL` | Narrative paragraph beneath hero headline. |
| `primary_cta_label` | `VARCHAR(120)` | `NOT NULL` | Label for main action button (e.g. *Explore Creations*). |
| `primary_cta_href` | `VARCHAR(240)` | `NOT NULL` | Destination route for main action button (`/explore`). |
| `secondary_cta_label`| `VARCHAR(120)` | `NOT NULL` | Label for secondary button (e.g. *Start Creating*). |
| `secondary_cta_href` | `VARCHAR(240)` | `NOT NULL` | Destination route for secondary button (`/studio/upload`). |
| `footer_text` | `TEXT` | `NOT NULL` | Global platform tagline. |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | Timestamp of last modification. |

---

### 2.2 `profiles`
Represents creator identities, bios, verification status, and discipline classifications.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Internal profile ID. |
| `user_id` | `VARCHAR(120)`| `UNIQUE NOT NULL` | Auth provider or user account identifier. |
| `username` | `VARCHAR(80)` | `UNIQUE NOT NULL` | URL handle (e.g., `shubham` for `/shubham`). |
| `display_name` | `VARCHAR(160)`| Nullable | Full name or studio title. |
| `bio` | `TEXT` | Nullable | Creator biography and discipline summary. |
| `avatar_url` | `TEXT` | Nullable | Profile avatar image URL. |
| `banner_url` | `TEXT` | Nullable | Profile banner cover image URL. |
| `verified` | `BOOLEAN` | Default `false` | Editorial verification badge. |
| `categories` | `JSONB` | Default `'[]'` | Array of disciplines (e.g. `["digital_art", "music"]`). |
| `social_links` | `JSONB` | Default `'{}'` | Social map (e.g. `{"twitter": "...", "github": "..."}`). |
| `followers_count` | `INTEGER` | Default `0` | Number of followers. |
| `views_count` | `INTEGER` | Default `0` | Total portfolio profile views. |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | Last update timestamp. |

**Indexes**:
- `idx_profiles_username ON profiles(username)`
- `idx_profiles_followers ON profiles(followers_count DESC)`

---

### 2.3 `projects`
Core repository of published creative works spanning visual, audio, film, writing, code, and physical crafts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Project identifier. |
| `title` | `VARCHAR(200)`| `NOT NULL` | Title of the creation. |
| `slug` | `VARCHAR(180)`| `UNIQUE NOT NULL` | SEO-friendly URL slug. |
| `description` | `TEXT` | Nullable | Comprehensive project narrative and notes. |
| `creator_id` | `VARCHAR(120)`| `NOT NULL` | Profile ID of the creator. |
| `creator_name` | `VARCHAR(160)`| Nullable | Display name of the creator at publish time. |
| `type` | `VARCHAR(80)` | `NOT NULL` | Discipline taxonomy (one of 33 content types). |
| `media_urls` | `JSONB` | Default `'[]'` | Array of full-resolution asset URLs. |
| `thumbnail_url` | `TEXT` | Nullable | Optimized card thumbnail URL. |
| `tags` | `JSONB` | Default `'[]'` | Keyword tags for indexing and discovery. |
| `ai_generated` | `BOOLEAN` | Default `false` | Transparent AI provenance flag. |
| `ai_model` | `VARCHAR(160)`| Nullable | Model/tool disclosure (e.g. Midjourney v6, Claude 3.7, Suno). |
| `views` | `INTEGER` | Default `0` | Total view count. |
| `likes_count` | `INTEGER` | Default `0` | Total appreciate / like count. |
| `saves_count` | `INTEGER` | Default `0` | Total bookmark / save count. |
| `published_at` | `TIMESTAMPTZ` | Default `NOW()` | Public release timestamp. |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | Record modification timestamp. |

**Indexes**:
- `idx_projects_slug ON projects(slug)`
- `idx_projects_type ON projects(type)`
- `idx_projects_creator ON projects(creator_id)`
- `idx_projects_ai_generated ON projects(ai_generated)`
- `idx_projects_published ON projects(published_at DESC)`
- `idx_projects_views ON projects(views DESC)`

---

### 2.4 `interactions`
Tracks user engagements (likes, bookmarks, views) with deduplication enforcement.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Interaction record ID. |
| `user_id` | `VARCHAR(120)`| `NOT NULL` | User performing the action. |
| `project_id` | `VARCHAR(180)`| `NOT NULL` | Target project. |
| `type` | `VARCHAR(50)` | `NOT NULL` | Interaction type: `'like'`, `'save'`, `'view'`. |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Timestamp. |

**Unique Constraint**:
- `CONSTRAINT uq_interactions_user_project_type UNIQUE (user_id, project_id, type)`

---

### 2.5 `comments`
Threaded discussion and creative critique on projects.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Comment ID. |
| `project_id` | `VARCHAR(180)`| `NOT NULL` | Project being discussed. |
| `user_id` | `VARCHAR(120)`| `NOT NULL` | Author user ID. |
| `parent_id` | `VARCHAR(64)` | Nullable | Parent comment ID for nested replies. |
| `content` | `TEXT` | `NOT NULL` | Text body. |
| `likes_count` | `INTEGER` | Default `0` | Upvotes on comment. |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Timestamp. |

---

### 2.6 `follows`
Represents the creator network graph.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Follow edge ID. |
| `follower_id` | `VARCHAR(120)`| `NOT NULL` | User following. |
| `following_id` | `VARCHAR(120)`| `NOT NULL` | Creator being followed. |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Edge creation timestamp. |

**Unique Constraint**:
- `CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id)`

---

### 2.7 `trending_cache`
Precomputed velocity-ranked project cache for instant `/trending` page queries.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Cache entry ID. |
| `period` | `VARCHAR(20)` | `NOT NULL` | Interval: `'day'`, `'week'`, `'month'`. |
| `project_id` | `VARCHAR(180)`| `NOT NULL` | Ranked project identifier. |
| `score` | `DOUBLE PRECISION`| `NOT NULL` | Computed velocity score (views + likes*3 + saves*5). |
| `rank` | `INTEGER` | `NOT NULL` | Ordinal rank (1, 2, 3...). |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | Calculation timestamp. |

**Unique Constraint**:
- `CONSTRAINT uq_trending_period_rank UNIQUE (period, rank)`

---

### 2.8 `communities` & `community_members`
Creative guilds, circles, and collective disciplinary studios.

- **`communities`**: `id`, `name`, `slug` (unique), `description`, `avatar_url`, `banner_url`, `owner_id`, `member_count`, `is_private`, `featured`, `created_at`, `updated_at`.
- **`community_members`**: `id`, `community_id`, `user_id`, `role` (`'owner'`, `'admin'`, `'member'`), `joined_at`.
  - Unique constraint: `(community_id, user_id)`.

---

### 2.9 `marketplace_listings`, `messages`, and `notifications`
- **`marketplace_listings`**: Creator commissions, physical prints, digital assets, pricing (`NUMERIC(10,2)`), currency, and download assets.
- **`messages`**: Direct peer communications with `sender_id`, `receiver_id`, `content`, and `is_read`.
- **`notifications`**: Targeted alerts with `type`, `title`, `message`, `link`, and `is_read`.

---

## 3. Database Initialization & Seeding Script

The repository includes an automated setup script at [`scripts/init-db.mjs`](../scripts/init-db.mjs).

```bash
npm run db:init
```

### What `init-db.mjs` executes:
1. Connects to `DATABASE_URL` via PostgreSQL client.
2. Reads and runs [`src/lib/db/schema.sql`](../src/lib/db/schema.sql) (`CREATE SCHEMA IF NOT EXISTS workofhuman` and all 12 tables + indexes).
3. Inserts starter editorial `homepage_settings` record (`ON CONFLICT (id) DO UPDATE`).
4. Closes connection cleanly with success reporting.

---

## 4. Querying Examples in Application Code

### Querying with JSONB tags:
```typescript
import { query } from "@/lib/db";

// Find projects tagged with "architecture"
const res = await query(
  "SELECT * FROM projects WHERE tags @> $1 ORDER BY published_at DESC LIMIT 20",
  [JSON.stringify(["architecture"])]
);
```

### Querying Transparent AI projects:
```typescript
// Fetch only transparently disclosed AI creations
const res = await query(
  "SELECT * FROM projects WHERE ai_generated = true ORDER BY published_at DESC LIMIT 24"
);
```
