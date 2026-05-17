# WorkOfHuman Appwrite Database Schema

The homepage reads only from Appwrite Database. It does not render hardcoded demo content.

## Required env

Use `.env.example` as the template. The server-side app needs:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`

## Collections

All collections should include:

- `isVisible` boolean, required
- `sortOrder` integer, required

### `homepage`

- `eyebrow` string, 220
- `heading` string, 500
- `subheading` string, 1000
- `primaryCtaLabel` string, 120
- `primaryCtaHref` string, 240
- `secondaryCtaLabel` string, 120
- `secondaryCtaHref` string, 240
- `footerText` string, 500

### `creations`

- `title` string, 180
- `creatorName` string, 160
- `contentType` string, 120
- `statLabel` string, 120
- `thumbnailUrl` url
- `accentColor` string, 32
- `featured` boolean

### `creators`

- `displayName` string, 160
- `category` string, 160
- `statLabel` string, 120
- `avatarUrl` url
- `verified` boolean

### `categories`

- `name` string, 120
- `slug` string, 120

### `communities`

- `name` string, 160
- `slug` string, 120
- `memberCountLabel` string, 120

### `feed_items`

- `body` string, 700
- `contentType` string, 120

### `ai_spotlights`

- `title` string, 160
- `body` string, 500

### `metrics`

- `label` string, 160
- `value` string, 80
