import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_URL ??
  "http://127.0.0.1:3001/api";

export async function GET(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      `${API_BASE_URL}/dashboard/members-trend`,
      {
        method: "GET",
        headers: authorization
          ? {
              Authorization: authorization,
            }
          : {},
        cache: "no-store",
      },
    );

    const data = await response
      .json()
      .catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Errore proxy members trend:",
      error,
    );

    return NextResponse.json(
      {
        message: "Errore members trend",
      },
      { status: 500 },
    );
  }
}