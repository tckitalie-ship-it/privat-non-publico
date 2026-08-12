import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await fetch(
      getBackendApiUrl("health"),
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        backend: "offline",
        database: "disconnected",
        api: "unavailable",
        security: "unknown",
      },
      {
        status: 503,
      },
    );
  }
}