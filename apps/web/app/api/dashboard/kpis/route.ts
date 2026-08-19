import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const headerAuthorization =
      request.headers.get("authorization");

    const cookieToken =
      cookieStore.get("access_token")?.value;

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
      `${API_BASE_URL}/dashboard/kpis`,
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
    console.error("Dashboard KPI proxy error:", error);

    return NextResponse.json(
      { message: "API NestJS non raggiungibile" },
      { status: 500 },
    );
  }
}