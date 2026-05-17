import { Models } from "node-appwrite";
import { appwriteConfig, getDatabases, homeQueries, isAppwriteConfigured } from "./appwrite";

export type HomeSettings = {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  footerText: string;
};

export type Creation = {
  title: string;
  creatorName: string;
  contentType: string;
  statLabel: string;
  thumbnailUrl: string;
  accentColor: string;
  featured: boolean;
  sortOrder: number;
};

export type Creator = {
  displayName: string;
  category: string;
  statLabel: string;
  avatarUrl: string;
  verified: boolean;
  sortOrder: number;
};

export type Category = {
  name: string;
  slug: string;
  sortOrder: number;
};

export type Community = {
  name: string;
  slug: string;
  memberCountLabel: string;
  sortOrder: number;
};

export type FeedItem = {
  body: string;
  contentType: string;
  sortOrder: number;
};

export type AiSpotlight = {
  title: string;
  body: string;
  sortOrder: number;
};

export type Metric = {
  label: string;
  value: string;
  sortOrder: number;
};

export type HomeData =
  | {
      status: "missing-config";
      missingEnv: string[];
    }
  | {
      status: "ready";
      settings: HomeSettings | null;
      creations: Creation[];
      creators: Creator[];
      categories: Category[];
      communities: Community[];
      feedItems: FeedItem[];
      aiSpotlights: AiSpotlight[];
      metrics: Metric[];
    }
  | {
      status: "error";
      message: string;
    };

function requiredEnv() {
  return ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID", "APPWRITE_API_KEY", "APPWRITE_DATABASE_ID"];
}

function missingEnv() {
  return requiredEnv().filter((key) => !process.env[key]);
}

function asDocument<T>(document: Models.Document) {
  return document as Models.Document & T;
}

async function listDocuments<T>(collectionId: string, queries = homeQueries.visible) {
  const databases = getDatabases();
  const response = await databases.listDocuments(appwriteConfig.databaseId, collectionId, queries);

  return response.documents.map((document) => asDocument<T>(document));
}

export async function getHomeData(): Promise<HomeData> {
  if (!isAppwriteConfigured()) {
    return {
      status: "missing-config",
      missingEnv: missingEnv(),
    };
  }

  try {
    const [homepage, creations, creators, categories, communities, feedItems, aiSpotlights, metrics] =
      await Promise.all([
        listDocuments<HomeSettings>(appwriteConfig.collections.homepage, [homeQueries.visible[0]]),
        listDocuments<Creation>(appwriteConfig.collections.creations, homeQueries.featured),
        listDocuments<Creator>(appwriteConfig.collections.creators),
        listDocuments<Category>(appwriteConfig.collections.categories),
        listDocuments<Community>(appwriteConfig.collections.communities),
        listDocuments<FeedItem>(appwriteConfig.collections.feedItems),
        listDocuments<AiSpotlight>(appwriteConfig.collections.aiSpotlights),
        listDocuments<Metric>(appwriteConfig.collections.metrics),
      ]);

    return {
      status: "ready",
      settings: homepage[0] ?? null,
      creations,
      creators,
      categories,
      communities,
      feedItems,
      aiSpotlights,
      metrics,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to load Appwrite content.",
    };
  }
}
