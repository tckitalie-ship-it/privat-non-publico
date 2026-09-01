import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/server-api";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const cookieToken =
      cookieStore.get("access_token")?.value;

    const headerAuthorization =
      request.headers.get("authorization");

    const token =
      cookieToken ??
      headerAuthorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        {
          message: "Authorization header mancante",
          error: "Unauthorized",
          statusCode: 401,
        },
        { status: 401 },
      );
    }

    const response = await fetch(
      getBackendApiUrl("dashboard/members-trend"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Errore proxy memberships trend:",
      error,
    );

    return NextResponse.json(
      {
        message: "API NestJS non raggiungibile",
      },
      { status: 500 },
    );
  }
}
