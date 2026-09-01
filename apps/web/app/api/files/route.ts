import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getHeaders(request: Request) {
  const cookieStore = await cookies();

  const cookieToken =
    cookieStore.get("access_token")?.value;

  const authorization =
    request.headers.get("authorization");

  const associationId =
    request.headers.get("x-association-id");

  return {
    Accept: "application/json",
    ...(authorization
      ? { Authorization: authorization }
      : cookieToken
        ? { Authorization: `Bearer ${cookieToken}` }
        : {}),
    ...(associationId
      ? { "x-association-id": associationId }
      : {}),
  };
}

export async function GET(request: Request) {
  try {
    const response = await fetch(
      getBackendApiUrl("files"),
      {
        method: "GET",
        headers: await getHeaders(request),
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("GET /api/files:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore caricamento file",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const cookieToken =
      cookieStore.get("access_token")?.value;

    const authorization =
      request.headers.get("authorization");

    const associationId =
      request.headers.get("x-association-id");

    const formData =
      await request.formData();

    const headers: Record<string, string> = {
      ...(authorization
        ? { Authorization: authorization }
        : cookieToken
          ? { Authorization: `Bearer ${cookieToken}` }
          : {}),
      ...(associationId
        ? { "x-association-id": associationId }
        : {}),
    };

    const response = await fetch(
      getBackendApiUrl("files/upload"),
      {
        method: "POST",
        headers,
        body: formData,
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("POST /api/files:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore caricamento file",
      },
      { status: 500 },
    );
  }
}
