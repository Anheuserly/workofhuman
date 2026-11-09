import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const robots = `# https://theworkofhuman.com robots.txt
User-agent: Googlebot-Image
Allow: /api/media/
Allow: /uploads/
Allow: /

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /studio/
Disallow: /settings/
Disallow: /messages/
Disallow: /notifications/

User-agent: Applebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Allow: /api/media/
Disallow: /admin/
Disallow: /studio/
Disallow: /settings/
Disallow: /api/
Disallow: /messages/
Disallow: /notifications/

Sitemap: https://theworkofhuman.com/sitemap.xml
`;

  return new NextResponse(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
