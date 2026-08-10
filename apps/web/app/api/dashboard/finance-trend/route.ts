import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/dashboard/finance-trend`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? [], {
      status: response.status,
    });
  } catch (error) {
    console.error("Finance trend proxy error:", error);

    return NextResponse.json(
      { message: "API NestJS non raggiungibile" },
      { status: 500 },
    );
  }
}
