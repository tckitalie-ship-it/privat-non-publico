import { getBackendApiUrl } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getAuthorization(request: Request) {
  const cookieStore = await cookies();

  const headerAuthorization =
    request.headers.get("authorization");

  const cookieToken =
    cookieStore.get("access_token")?.value;

  return (
    headerAuthorization ??
    (cookieToken ? `Bearer ${cookieToken}` : null)
  );
}

export async function GET(request: Request) {
  try {
    const authorization = await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const associationId =
      request.headers.get("x-association-id");

    const headers: HeadersInit = {
      Accept: "application/json",
      Authorization: authorization,
    };

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      getBackendApiUrl("memberships"),
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(
      data ?? [],
      { status: response.status },
    );
  } catch (error) {
    console.error("Memberships GET proxy error:", error);

    return NextResponse.json(
      { message: "API NestJS non raggiungibile" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const associationId =
      request.headers.get("x-association-id");

    const body = await request.json();

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorization,
    };

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      getBackendApiUrl("memberships"),
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(
      data ?? {},
      { status: response.status },
    );
  } catch (error) {
    console.error("Memberships POST proxy error:", error);

    return NextResponse.json(
      { message: "API NestJS non raggiungibile" },
      { status: 500 },
    );
  }
}
