import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        {
          message: "Authorization header mancante",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/dashboard/recent-activity`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const text = await response.text();

    let data: unknown = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Recent activity proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message: "API NestJS non raggiungibile",
      },
      {
        status: 500,
      },
    );
  }
}