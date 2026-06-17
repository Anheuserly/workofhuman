import { Client, Databases, Query } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT ?? process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID ?? process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

export const appwriteConfig = {
  endpoint,
  projectId,
  apiKey,
  databaseId: process.env.APPWRITE_DATABASE_ID ?? "main_db",
  collections: {
    profiles: process.env.APPWRITE_PROFILES_COLLECTION_ID ?? "profiles",
    projects: process.env.APPWRITE_PROJECTS_COLLECTION_ID ?? "projects",
    interactions: process.env.APPWRITE_INTERACTIONS_COLLECTION_ID ?? "interactions",
    comments: process.env.APPWRITE_COMMENTS_COLLECTION_ID ?? "comments",
    follows: process.env.APPWRITE_FOLLOWS_COLLECTION_ID ?? "follows",
    trendingCache: process.env.APPWRITE_TRENDING_CACHE_COLLECTION_ID ?? "trending_cache",
    communities: process.env.APPWRITE_COMMUNITIES_COLLECTION_ID ?? "communities",
    communityMembers: process.env.APPWRITE_COMMUNITY_MEMBERS_COLLECTION_ID ?? "community_members",
    editorPicks: process.env.APPWRITE_EDITOR_PICKS_COLLECTION_ID ?? "editor_picks",
    aiMetadata: process.env.APPWRITE_AI_METADATA_COLLECTION_ID ?? "ai_metadata",
    marketplaceListings: process.env.APPWRITE_MARKETPLACE_COLLECTION_ID ?? "marketplace_listings",
    homepage: process.env.APPWRITE_HOMEPAGE_COLLECTION_ID ?? "homepage",
  },
};

export function missingAppwriteEnv() {
  return ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID", "APPWRITE_API_KEY", "APPWRITE_DATABASE_ID"].filter(
    (key) => !process.env[key],
  );
}

export function isAppwriteConfigured() {
  return Boolean(endpoint && projectId && apiKey && appwriteConfig.databaseId);
}

export function getDatabases() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  return new Databases(client);
}

export const appwriteQueries = {
  published: [Query.orderDesc("publishedAt"), Query.limit(24)],
  trending: [Query.equal("period", "week"), Query.orderAsc("rank"), Query.limit(12)],
  topCreators: [Query.orderDesc("followersCount"), Query.limit(8)],
  featuredCommunities: [Query.equal("featured", true), Query.orderDesc("memberCount"), Query.limit(6)],
  aiSpotlight: [Query.equal("aiGenerated", true), Query.orderDesc("views"), Query.limit(6)],
};
