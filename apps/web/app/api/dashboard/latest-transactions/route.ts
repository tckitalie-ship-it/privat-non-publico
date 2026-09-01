import { getBackendApiUrl } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const headerAuthorization =
      request.headers.get("authorization");

    const cookieToken =
      cookieStore.get("access_token")?.value ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    const authorization =
      headerAuthorization ??
      (cookieToken ? `Bearer ${cookieToken}` : null);

    if (!authorization) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${getBackendApiUrl("dashboard/latest-transactions")}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Dashboard latest transactions proxy error:",
      error,
    );

    return NextResponse.json(
      { message: "API NestJS non raggiungibile" },
      { status: 500 },
    );
  }
}


