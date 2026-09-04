import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(
      getBackendApiUrl("reminders"),
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
            : "Errore caricamento reminder",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(
      getBackendApiUrl("reminders"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        body,
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
            : "Errore creazione reminder",
      },
      { status: 500 },
    );
  }
}
