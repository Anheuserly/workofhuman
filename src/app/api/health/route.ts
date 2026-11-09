import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbCheck = await checkDatabaseConnection();

  if (!dbCheck.ok) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: dbCheck.error,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      db: "up",
      database: dbCheck.database,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
