import { getBackendApiUrl } from "@/lib/server-api";
import { NextRequest, NextResponse } from "next/server";



function getHeaders(request: NextRequest) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const headerAuthorization =
    request.headers.get("authorization");

  const cookieToken =
    request.cookies.get("access_token")?.value;

  const authorization =
    headerAuthorization ??
    (cookieToken
      ? `Bearer ${cookieToken}`
      : null);

  if (authorization) {
    headers.Authorization = authorization;
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const associationId =
      request.headers.get("x-association-id") ??
      request.nextUrl.searchParams.get("associationId");

    if (!associationId) {
      return NextResponse.json(
        {
          message: "Association ID mancante",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getBackendApiUrl("events/association/")}${associationId}`,
      {
        method: "GET",
        headers: getHeaders(request),
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy GET events:", error);

    return NextResponse.json(
      {
        message: "Backend non raggiungibile",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch(
      `${getBackendApiUrl("events")}`,
      {
        method: "POST",
        headers: {
          ...getHeaders(request),
          "Content-Type": "application/json",
        },
        body,
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy POST events:", error);

    return NextResponse.json(
      {
        message: "Backend non raggiungibile",
      },
      { status: 502 },
    );
  }
}
