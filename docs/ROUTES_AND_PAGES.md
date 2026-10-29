# Routes & Page Specifications

This document catalogs every page, dynamic parameter, data source, and user flow across **WorkOfHuman**.

---

## Route Catalog

```
/
├── /[username]                  # Dynamic creator portfolio & profile
├── /admin                       # Moderation & platform health dashboard
├── /ai                          # Transparent AI creations directory
├── /categories
│   └── /[slug]                  # Discipline-specific creative feed
├── /communities
│   └── /[communityId]           # Creative guild / collective details
├── /explore                     # Complete discovery atlas of all works
├── /marketplace                 # Licensing, physical prints & commission listings
├── /messages                    # Direct creator-to-creator communication
├── /notifications               # Platform activity and interaction signals
├── /settings                    # Creator preferences and AI disclosure toggles
├── /studio
│   └── /upload                  # Creation upload & metadata intake studio
└── /trending                    # Velocity & engagement ranked creations
```

---

## Detailed Page Specifications

### 1. Editorial Homepage (`/`)
- **File**: `src/app/page.tsx`
- **Render Mode**: Server Component (`force-dynamic`).
- **Data Source**: `getHomeData()` from `src/lib/home-data.ts`.
- **Purpose**: High-impact editorial showcase displaying:
  - Dynamic hero copywriting from `homepage_settings`.
  - Multi-panel hero media cards showcasing top-ranked creations.
  - Featured creator spotlight tiles.
  - Category ribbon across 33 creative mediums.
  - Direct call-to-action buttons for exploration and creation.

---

### 2. Creator Profile (`/[username]`)
- **File**: `src/app/[username]/page.tsx`
- **Dynamic Param**: `username` (e.g. `/shubham` or `/@studio_nine`).
- **Data Source**: `getProfileByUsername(username)` querying `profiles` and `projects`.
- **Key Features**:
  - Automatically strips leading `@` or URL-encoded `%40`.
  - Creator bio, verification badge (`BadgeCheck`), follower count, and total view count.
  - Filterable gallery of all creative works authored by the creator.
  - Responsive empty state if creator has not published projects yet.

---

### 3. Living Exploration Atlas (`/explore`)
- **File**: `src/app/explore/page.tsx`
- **Render Mode**: Server Component (`force-dynamic`).
- **Data Source**: Queries all projects published in PostgreSQL ordered by `published_at DESC`.
- **Key Features**:
  - Responsive 4-column project grid with `ProjectCard`.
  - Displays thumbnail, creator attribution, discipline pill, and AI disclosure label.
  - Clean `EmptyState` when the database has no published projects.

---

### 4. Real-Time Trending Pulse (`/trending`)
- **File**: `src/app/trending/page.tsx`
- **Data Source**: `trending_cache` joined with `projects`.
- **Key Features**:
  - Displays engagement velocity rank (Rank #1, #2, #3...) and score.
  - Time period toggle indicator (`day`, `week`, `month`).
  - Direct card click to view project details.

---

### 5. Transparent AI Hub (`/ai`)
- **File**: `src/app/ai/page.tsx`
- **Data Source**: `projects` table filtered by `ai_generated = true`.
- **Philosophy**: WorkOfHuman believes AI should be transparently celebrated, not deceptively masked.
- **Key Features**:
  - Highlights AI model attribution (e.g., Midjourney, Flux, Suno, Claude).
  - Explicit provenance tags on every project card.

---

### 6. Discipline Categories (`/categories/[slug]`)
- **File**: `src/app/categories/[slug]/page.tsx`
- **Dynamic Param**: `slug` (matches one of 33 `contentTypes` in `src/lib/platform.ts`, e.g. `architecture`, `digital_art`, `indie_games`).
- **Data Source**: `getProjectsByCategory(slug)`.
- **Key Features**:
  - Automatically formats underscores to friendly headline titles.
  - Curated discipline feed displaying relevant medium works.

---

### 7. Creative Communities (`/communities` & `/communities/[communityId]`)
- **Files**: `src/app/communities/page.tsx`, `src/app/communities/[communityId]/page.tsx`
- **Data Source**: `communities` and `community_members` tables.
- **Purpose**: Guilds, collectives, and disciplinary studios where creators collaborate on multi-artist projects and share critique.

---

### 8. Creator Marketplace (`/marketplace`)
- **File**: `src/app/marketplace/page.tsx`
- **Data Source**: `marketplace_listings` table.
- **Purpose**: Direct creator economy surface for digital asset licensing, prints, commissioned services, and architectural/design studies.

---

### 9. Multi-Medium Upload Studio (`/studio/upload`)
- **File**: `src/app/studio/upload/page.tsx`
- **Key Features**:
  - Universal intake supporting:
    - Visual works (art, design, photography, 3D, fashion).
    - Motion works (films, shorts, cinematic edits, animation).
    - Audio works (music tracks, podcasts, sound experiments).
    - Writing & Code (literature, articles, indie game prototypes).
  - Drag-and-drop file ingestion zone.
  - Metadata form: title, slug, description, category selector, tags.
  - Mandatory transparent AI disclosure toggle.

---

### 10. Direct Messages (`/messages`)
- **File**: `src/app/messages/page.tsx`
- **Data Source**: `messages` table.
- **Purpose**: Peer-to-peer creator messaging, commission inquiry management, and private collaboration discussion.

---

### 11. Activity & Notifications (`/notifications`)
- **File**: `src/app/notifications/page.tsx`
- **Data Source**: `notifications` table.
- **Purpose**: Signal center tracking creator appreciation likes, bookmarks, new followers, and community mentions.

---

### 12. Settings & Studio Preferences (`/settings`)
- **File**: `src/app/settings/page.tsx`
- **Purpose**: Creator control room for managing profile details, default AI disclosure preferences, social links, and notifications.

---

### 13. Admin & Platform Moderation (`/admin`)
- **File**: `src/app/admin/page.tsx`
- **Data Source**: PostgreSQL system queries & role authorization.
- **Purpose**: Protected control center for platform health, report queues, editor picks curation, and creator verification badges.
