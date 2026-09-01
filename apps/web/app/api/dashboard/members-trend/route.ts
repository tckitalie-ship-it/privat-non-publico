import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("access_token")?.value ??
      request.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");

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
      `${API_BASE_URL}/dashboard/members-trend`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Errore proxy members trend:", error);

    return NextResponse.json(
      {
        message: "Errore members trend",
      },
      { status: 500 },
    );
  }
}
