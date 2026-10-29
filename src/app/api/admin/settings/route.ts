import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

const SettingsSchema = z.object({
  eyebrow: z.string().trim().min(2),
  heading: z.string().trim().min(2),
  subheading: z.string().trim().min(2),
  primaryCtaLabel: z.string().trim().min(2),
  primaryCtaHref: z.string().trim().min(1),
  secondaryCtaLabel: z.string().trim().min(2),
  secondaryCtaHref: z.string().trim().min(1),
  footerText: z.string().trim().min(2),
});

export async function PUT(request: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = SettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid homepage settings data." },
        { status: 400 }
      );
    }

    const {
      eyebrow,
      heading,
      subheading,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      footerText,
    } = parsed.data;

    await query(
      `INSERT INTO workofhuman.homepage_settings (
         id, eyebrow, heading, subheading, primary_cta_label, primary_cta_href,
         secondary_cta_label, secondary_cta_href, footer_text, updated_at
       ) VALUES (
         'default', $1, $2, $3, $4, $5, $6, $7, $8, NOW()
       )
       ON CONFLICT (id) DO UPDATE SET
         eyebrow = EXCLUDED.eyebrow,
         heading = EXCLUDED.heading,
         subheading = EXCLUDED.subheading,
         primary_cta_label = EXCLUDED.primary_cta_label,
         primary_cta_href = EXCLUDED.primary_cta_href,
         secondary_cta_label = EXCLUDED.secondary_cta_label,
         secondary_cta_href = EXCLUDED.secondary_cta_href,
         footer_text = EXCLUDED.footer_text,
         updated_at = NOW()`,
      [
        eyebrow,
        heading,
        subheading,
        primaryCtaLabel,
        primaryCtaHref,
        secondaryCtaLabel,
        secondaryCtaHref,
        footerText,
      ]
    );

    return NextResponse.json({ success: true, message: "Homepage settings updated successfully." });
  } catch (err) {
    console.error("[Admin Settings Error]:", err);
    return NextResponse.json({ error: "Failed to update platform settings." }, { status: 500 });
  }
}
