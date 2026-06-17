# WorkOfHuman Appwrite Schema

Database ID: `main_db`

The frontend renders Appwrite documents and empty states. It does not use mock fallback content for feeds.

## Required Environment

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

## Collections

### `homepage`

- `eyebrow` string, required, size 220
- `heading` string, required, size 500
- `subheading` string, required, size 1000
- `primaryCtaLabel` string, required, size 120
- `primaryCtaHref` string, required, size 240
- `secondaryCtaLabel` string, required, size 120
- `secondaryCtaHref` string, required, size 240
- `footerText` string, required, size 500

### `profiles`

- `userId` string, required
- `username` string, required
- `displayName` string, size 160
- `bio` string, size 500
- `avatarUrl` string, size 500
- `bannerUrl` string, size 500
- `verified` boolean, default false
- `categories` string array
- `socialLinks` string, size 2000
- `followersCount` integer, default 0
- `viewsCount` integer, default 0
- `createdAt` datetime
- `updatedAt` datetime

Indexes:

- unique `username`
- key `userId`
- key `followersCount`, descending

### `projects`

- `title` string, required, size 180
- `slug` string, required, size 160
- `description` string, size 5000
- `creatorId` string, required
- `creatorName` string, size 160
- `type` string, required, size 80
- `mediaUrls` string array
- `thumbnailUrl` string, size 500
- `tags` string array
- `aiGenerated` boolean, default false
- `aiModel` string, size 160
- `views` integer, default 0
- `likesCount` integer, default 0
- `savesCount` integer, default 0
- `createdAt` datetime
- `publishedAt` datetime

Indexes:

- unique `slug`
- key `creatorId`
- key `type`
- key `aiGenerated`
- key `publishedAt`, descending
- key `views`, descending

### `interactions`

- `userId` string, required
- `projectId` string, required
- `type` string, required
- `createdAt` datetime

Indexes:

- unique composite `userId`, `projectId`, `type`
- key `projectId`

### `comments`

- `projectId` string, required
- `userId` string, required
- `parentId` string
- `content` string, required, size 2000
- `likesCount` integer, default 0
- `createdAt` datetime

Indexes:

- key `projectId`
- key `parentId`

### `follows`

- `followerId` string, required
- `followingId` string, required
- `createdAt` datetime

Indexes:

- unique composite `followerId`, `followingId`
- key `followingId`

### `trending_cache`

- `period` string, required
- `projectId` string, required
- `score` float, required
- `rank` integer, required
- `updatedAt` datetime

Indexes:

- key composite `period`, `rank`
- key `period`

### `communities`

- `name` string, required, size 160
- `slug` string, required, size 120
- `description` string, size 1000
- `avatarUrl` string, size 500
- `bannerUrl` string, size 500
- `ownerId` string, required
- `memberCount` integer, default 0
- `isPrivate` boolean, default false
- `featured` boolean, default false
- `createdAt` datetime

Indexes:

- unique `slug`
- key `featured`
- key `memberCount`, descending

### `community_members`

- `communityId` string, required
- `userId` string, required
- `role` string, required
- `joinedAt` datetime

Indexes:

- unique composite `communityId`, `userId`
- key `userId`

### Future MVP Collections

Create as features are implemented:

- `ai_metadata`
- `ai_generations`
- `editor_picks`
- `rising_creators`
- `reports`
- `moderation_queue`
- `saves`
- `reposts`
- `subscriptions`
- `memberships`
- `marketplace_listings`
- `tips`
- `digital_sales`
