import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server-api";

const API_BASE_URL = getBackendApiUrl();

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

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

    const response = await fetch(`${API_BASE_URL}/dashboard/kpis`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    });

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
    console.error("Dashboard KPI proxy error:", error);

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
