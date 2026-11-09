# Live System Audit: The Work of Human (theworkofhuman.com)

**Date of Audit**: November 9, 2026  
**Environment**: Production (Cloudflare Workers via OpenNext + PostgreSQL on VPS)  
**Domain**: `https://theworkofhuman.com`  
**Mission Phase**: P0-0 (Ground Truth + Safety Net)

---

## 1. Live Endpoint Probing & HTTP Status

All public endpoints were probed directly via HTTPS to record HTTP status codes, latency, cache controls, and server response headers.

| Endpoint | HTTP Status | Response Time | Content-Type | Cache-Control | Edge Ray & Server |
|---|---|---|---|---|---|
| `/` | `200 OK` | ~1.1s - 2.8s | `text/html; charset=utf-8` | `private, no-cache, no-store, max-age=0, must-revalidate` | Cloudflare / OpenNext Worker |
| `/explore` | `200 OK` | ~1.1s | `text/html; charset=utf-8` | `private, no-cache, no-store, max-age=0, must-revalidate` | Cloudflare / OpenNext Worker |
| `/submit` | `200 OK` *(Bug)* | ~746ms | `text/html; charset=utf-8` | `private, no-cache, no-store, max-age=0, must-revalidate` | Renders `Creator Not Found` (see Bug #1) |
| `/login` | `200 OK` | ~307ms | `text/html; charset=utf-8` | `s-maxage=31536000` (Static Edge) | Cloudflare / OpenNext Worker |
| `/about` | `200 OK` | ~319ms | `text/html; charset=utf-8` | `s-maxage=31536000` (Static Edge) | Cloudflare / OpenNext Worker |
| `/robots.txt` | `200 OK` | ~182ms | `text/plain` | `public, max-age=86400, s-maxage=86400` | Cloudflare Edge |
| `/sitemap.xml` | `200 OK` | ~332ms | `application/xml` | `public, max-age=0, must-revalidate` | Cloudflare Edge |
| `/manifest.webmanifest` | `200 OK` | ~150ms | `application/manifest+json` | `public, max-age=0, must-revalidate` | Cloudflare Edge |
| `/feed.xml` | `200 OK` | ~210ms | `application/xml; charset=utf-8` | `public, max-age=3600, s-maxage=3600` | Cloudflare Edge |
| `/llms.txt` | `200 OK` | ~120ms | `text/plain` | `public, max-age=0, must-revalidate` | Cloudflare Edge |
| `/@e98ae946/67170d0e` | `200 OK` | ~1.0s | `text/html; charset=utf-8` | `private, no-cache, no-store, max-age=0, must-revalidate` | Cloudflare / OpenNext Worker |

---

## 2. Lighthouse Audit (Mobile Emulation)

Audits were executed using headless Google Chrome (`Lighthouse 13.6.0`, mobile form-factor, 4G throttling emulation).

### A. Homepage (`https://theworkofhuman.com/`)
* **SEO**: **100 / 100** (Meets target = 100)
* **Accessibility**: **96 / 100** (Meets target >= 95)
* **Best Practices**: **100 / 100**
* **Performance**: **65 / 100** (Baseline; throttled mobile emulation without edge asset caching)
  * *First Contentful Paint (FCP)*: 2.1s
  * *Largest Contentful Paint (LCP)*: 4.2s (attributed to dynamic hero media fetch)
  * *Cumulative Layout Shift (CLS)*: 0.00
  * *Total Blocking Time (TBT)*: 80ms

### B. Work Detail Page (`https://theworkofhuman.com/@e98ae946/67170d0e`)
* **SEO**: **100 / 100** (Meets target = 100)
* **Accessibility**: **95 / 100** (Meets target >= 95)
* **Best Practices**: **96 / 100**
* **Performance**: **74 / 100**
  * *First Contentful Paint (FCP)*: 1.8s
  * *Cumulative Layout Shift (CLS)*: 0.01
  * *Total Blocking Time (TBT)*: 90ms

---

## 3. Repository & Architecture Inventory

### Active Routes
* **Public Core**:
  * `/` — Home feed with featured works
  * `/about` — Platform manifesto and mission
  * `/explore` — Multi-discipline filter and search
  * `/trending` — Algorithmic engagement reel
  * `/categories` & `/categories/[slug]` — 30+ creative discipline feeds
  * `/communities` & `/communities/[communityId]` — Discipline guild collective hubs
  * `/marketplace` — Digital goods directory
  * `/[username]` — Creator profile space
  * `/[username]/[projectSlug]` — Primary creation detail page with media viewer
* **Auth & Studio**:
  * `/login` & `/register` — Authentication views
  * `/settings` — Profile bio, categories, and direct tip jar handles (UPI, Ko-fi, BuyMeACoffee, PayPal)
  * `/studio/upload` — Current creation upload form
  * `/messages` — Direct creator communication
  * `/notifications` — Notification stream
  * `/admin` — Basic admin overview
* **System & Feeds**:
  * `/api/health` — System status & DB probe (`{ ok: true, db: "up" }`)
  * `/robots.txt` — Robot crawling directives
  * `/sitemap.xml` — Dynamic XML sitemap with Google Image extension
  * `/feed.xml` — RSS 2.0 syndication feed
  * `/manifest.webmanifest` — PWA manifest
  * `/llms.txt` — LLM & Perplexity knowledge graph definition
  * `/opensearch.xml` — Browser search engine registration

### Active Database Tables (`workofhuman` schema on PostgreSQL)
* `comments` (2 rows) — Feedback on works
* `communities` (3 rows) — Indie Filmmakers, AI Experimenters, Open Source Makers
* `community_members` (0 rows) — Guild memberships
* `follows` (0 rows) — Creator follows
* `homepage_settings` (1 rows) — Curated homepage configuration
* `interactions` (0 rows) — Activity tracking
* `marketplace_listings` (0 rows) — Digital goods listings
* `media_files` (3 rows) — Local byte-stored fallback media
* `messages` (0 rows) — Creator direct messages
* `notifications` (0 rows) — User notifications
* `profiles` (1 rows) — User identity, bio, and social links
* `projects` (2 rows) — Published creations (*WABI SABI*, *He just wanted to be whole... 🥑😭*)
* `sessions` (3 rows) — Auth sessions
* `trending_cache` (0 rows) — Ranked cache

### Active Environment Variables
* `DATABASE_URL`: `postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman`
* `NEXT_PUBLIC_APP_URL`: `https://theworkofhuman.com`
* Media storage: Self-managed VPS streaming via `vps.amcmep.in:8080/media/` and PostgreSQL byte fallback.

---

## 4. Key Bugs Identified & Root Causes

### Bug 1: `/submit` returns "Creator Not Found"
* **Symptom**: Navigating to `https://theworkofhuman.com/submit` renders a 200 page displaying `"Creator Not Found — We couldn't find a creator profile for @submit"`.
* **Root Cause**: Next.js App Router dynamic route precedence: `src/app/[username]/page.tsx` captures any single-segment path `/xyz`. Because there was no route file at `src/app/submit/page.tsx` (the previous studio was nested at `/studio/upload`), Next.js treated `"submit"` as a creator username.
* **Resolution Plan**: In Phase P0-2, create the dedicated route at `src/app/submit/page.tsx` (or `src/app/(auth)/submit/[step]/page.tsx`), and add a route exclusion check or redirect so static paths never match the dynamic creator catch-all.

### Bug 2: Missing `/api/health` endpoint
* **Symptom**: Monitoring and uptime probes had no authenticated health endpoint.
* **Fix**: Implemented `src/app/api/health/route.ts` checking PostgreSQL connectivity via `checkDatabaseConnection()` and returning `{ ok: true, db: "up", database: "workofhuman", timestamp: "..." }`.

---

## 5. Phase P0-0 Sign-Off Checklist
- [x] Probed live site (`/`, `/explore`, `/submit`, `/login`, `/about`, `/robots.txt`, `/sitemap.xml`) and recorded HTTP status & headers.
- [x] Ran mobile Lighthouse audits on `/` and a work page; saved metrics (SEO 100, A11y 95-96).
- [x] Inventory completed for routes, components, environment variables, and PostgreSQL schema.
- [x] Created `src/app/api/health/route.ts` returning `{ ok: true, db: "up" }`.
- [x] Documented all findings in `docs/audit/live.md`.
