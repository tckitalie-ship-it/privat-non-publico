import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      getBackendApiUrl("notifications/me"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore caricamento notifiche",
      },
      { status: 500 },
    );
  }
}
