import { Client, Databases, Query } from "node-appwrite";

const appwriteEndpoint = process.env.APPWRITE_ENDPOINT;
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID;
const appwriteApiKey = process.env.APPWRITE_API_KEY;

export const appwriteConfig = {
  endpoint: appwriteEndpoint,
  projectId: appwriteProjectId,
  apiKey: appwriteApiKey,
  databaseId: process.env.APPWRITE_DATABASE_ID ?? "workofhuman",
  collections: {
    homepage: process.env.APPWRITE_HOMEPAGE_COLLECTION_ID ?? "homepage",
    creations: process.env.APPWRITE_CREATIONS_COLLECTION_ID ?? "creations",
    creators: process.env.APPWRITE_CREATORS_COLLECTION_ID ?? "creators",
    categories: process.env.APPWRITE_CATEGORIES_COLLECTION_ID ?? "categories",
    communities: process.env.APPWRITE_COMMUNITIES_COLLECTION_ID ?? "communities",
    feedItems: process.env.APPWRITE_FEED_ITEMS_COLLECTION_ID ?? "feed_items",
    aiSpotlights: process.env.APPWRITE_AI_SPOTLIGHTS_COLLECTION_ID ?? "ai_spotlights",
    metrics: process.env.APPWRITE_METRICS_COLLECTION_ID ?? "metrics",
  },
};

export function isAppwriteConfigured() {
  return Boolean(appwriteEndpoint && appwriteProjectId && appwriteApiKey);
}

export function getDatabases() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  const client = new Client()
    .setEndpoint(appwriteEndpoint!)
    .setProject(appwriteProjectId!)
    .setKey(appwriteApiKey!);

  return new Databases(client);
}

export const homeQueries = {
  featured: [Query.equal("featured", true), Query.orderAsc("sortOrder"), Query.limit(12)],
  visible: [Query.equal("isVisible", true), Query.orderAsc("sortOrder"), Query.limit(20)],
  newest: [Query.orderDesc("$createdAt"), Query.limit(20)],
};
