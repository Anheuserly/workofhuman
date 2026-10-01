-- WorkOfHuman Database Schema (PostgreSQL)
-- Database: workofhuman

CREATE SCHEMA IF NOT EXISTS workofhuman;
SET search_path TO workofhuman, public;

-- 1. Homepage Settings
CREATE TABLE IF NOT EXISTS homepage_settings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
    eyebrow TEXT NOT NULL,
    heading TEXT NOT NULL,
    subheading TEXT NOT NULL,
    primary_cta_label VARCHAR(120) NOT NULL,
    primary_cta_href VARCHAR(240) NOT NULL,
    secondary_cta_label VARCHAR(120) NOT NULL,
    secondary_cta_href VARCHAR(240) NOT NULL,
    footer_text TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Creator Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(120) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    display_name VARCHAR(160),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    verified BOOLEAN DEFAULT false,
    categories JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    followers_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(followers_count DESC);

-- 3. Projects & Creative Works
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(180) UNIQUE NOT NULL,
    description TEXT,
    creator_id VARCHAR(120) NOT NULL,
    creator_name VARCHAR(160),
    type VARCHAR(80) NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(160),
    views INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_ai_generated ON projects(ai_generated);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_views ON projects(views DESC);

-- 4. User Interactions (Likes, Saves, Views)
CREATE TABLE IF NOT EXISTS interactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(120) NOT NULL,
    project_id VARCHAR(180) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_interactions_user_project_type UNIQUE (user_id, project_id, type)
);

CREATE INDEX IF NOT EXISTS idx_interactions_project ON interactions(project_id);

-- 5. Comments
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(180) NOT NULL,
    user_id VARCHAR(120) NOT NULL,
    parent_id VARCHAR(64),
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- 6. Follows
CREATE TABLE IF NOT EXISTS follows (
    id VARCHAR(64) PRIMARY KEY,
    follower_id VARCHAR(120) NOT NULL,
    following_id VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 7. Trending Cache
CREATE TABLE IF NOT EXISTS trending_cache (
    id VARCHAR(64) PRIMARY KEY,
    period VARCHAR(20) NOT NULL,
    project_id VARCHAR(180) NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    rank INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_trending_period_rank UNIQUE (period, rank)
);

CREATE INDEX IF NOT EXISTS idx_trending_period ON trending_cache(period);

-- 8. Communities
CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    owner_id VARCHAR(120) NOT NULL,
    member_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_featured ON communities(featured);
CREATE INDEX IF NOT EXISTS idx_communities_members ON communities(member_count DESC);

-- 9. Community Members
CREATE TABLE IF NOT EXISTS community_members (
    id VARCHAR(64) PRIMARY KEY,
    community_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(120) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_community_members_community_user UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);

-- 10. Marketplace Listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(180),
    creator_id VARCHAR(120) NOT NULL,
    title VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    sender_id VARCHAR(120) NOT NULL,
    receiver_id VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(120) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
