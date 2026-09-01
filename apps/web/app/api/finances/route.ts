import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";



export async function POST(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    const body = await request.json();

    const response = await fetch(
      `${getBackendApiUrl("finances")}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore creazione transazione",
      },
      { status: 500 },
    );
  }
}
