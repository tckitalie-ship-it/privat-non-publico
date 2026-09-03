import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";



function getHeaders(request: Request) {
  const authorization =
    request.headers.get("authorization");

  return {
    Accept: "application/json",
    ...(authorization
      ? { Authorization: authorization }
      : {}),
  };
}
 export async function GET(request: Request) {
  try {
    const response = await fetch(
      `${getBackendApiUrl("notifications/me")}`,
      {
        method: "GET",
        headers: getHeaders(request),
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
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${getBackendApiUrl("notifications")}`,
      {
        method: "POST",
        headers: {
          ...getHeaders(request),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
            : "Errore creazione notifica",
      },
      { status: 500 },
    );
  }
}

