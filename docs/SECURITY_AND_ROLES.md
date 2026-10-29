# Security, Roles & Data Protection

This document outlines security measures, role authorization, data validation, and protective controls implemented across **WorkOfHuman**.

---

## 1. Authentication & Role-Based Access Control (RBAC)

WorkOfHuman distinguishes between three principal actor tiers:

| Role | Access Scope | Protected Surfaces |
| :--- | :--- | :--- |
| **Anonymous Visitor** | Read-only discovery across public creations, profiles, and feeds. | `/`, `/explore`, `/trending`, `/ai`, `/categories/[slug]`, `/[username]` |
| **Registered Creator** | Project uploads, portfolio customization, comments, bookmarks, marketplace listings, direct messaging. | `/studio/upload`, `/settings`, `/messages`, `/notifications` |
| **Administrator** | Content moderation, verification badges, editorial spotlight curation, system health monitoring. | `/admin` |

---

## 2. Admin Dashboard Protection (`/admin`)

The `/admin` surface is designed for platform operators:
- Protects editorial curation of `homepage_settings`.
- Allows toggling `verified` status in the `profiles` table.
- Reviews flagged creations in moderation queues.

### Route Guard Implementation Pattern
```typescript
// Guard pattern for protected surfaces
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth"; // or session check

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?next=/admin");
  }
  return user;
}
```

---

## 3. SQL Injection Prevention & Parameterization

WorkOfHuman **strictly enforces parameterized queries** across the entire database abstraction layer. String interpolation or manual query concatenation is never permitted.

### Safe Parameterization Pattern:
```typescript
import { query } from "@/lib/db";

// CORRECT: Parameterized placeholders ($1, $2)
export async function getProjectsByCategory(categorySlug: string) {
  const result = await query(
    `SELECT * FROM projects 
     WHERE type = $1 
     ORDER BY published_at DESC 
     LIMIT 48`,
    [categorySlug]
  );
  return result.rows;
}
```

### Why this is secure:
The PostgreSQL wire protocol sends query templates and arguments as separate network packets, preventing adversarial inputs from altering SQL AST parsing regardless of special characters (`'`, `"`, `;`, `--`).

---

## 4. Input Validation & Schema Sanitization with Zod

All client-submitted data (project titles, bios, comments, tags) must pass schema validation before entering the database:

```typescript
import { z } from "zod";

export const ProjectSubmissionSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  slug: z.string().min(2).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().max(10000).optional(),
  type: z.enum([
    "digital_art",
    "films",
    "music",
    "coding_projects",
    "architecture",
    // ... all 33 platform types
  ]),
  mediaUrls: z.array(z.string().url()).min(1),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string().max(40)).max(20),
  aiGenerated: z.boolean().default(false),
  aiModel: z.string().max(160).optional(),
});
```

---

## 5. Environment Secrets & Client Bundle Isolation

WorkOfHuman safeguards sensitive infrastructure credentials:
1. `DATABASE_URL` is never prefixed with `NEXT_PUBLIC_`. This ensures Next.js compiler completely strips it from browser bundles.
2. Only `NEXT_PUBLIC_APP_URL` is exposed to the client for canonical URL construction.
3. Database queries only execute inside Server Components or Server Actions on the server side.

---

## 6. XSS Prevention

- **React 19 Auto-Escaping**: All text rendered inside JSX expressions is automatically HTML-escaped by React.
- **Media Asset Isolation**: All user-submitted media URLs (`media_urls`, `thumbnail_url`, `avatar_url`) are rendered through Next.js `<Image />` or strict `<a>` tags with `rel="noopener noreferrer"`.
