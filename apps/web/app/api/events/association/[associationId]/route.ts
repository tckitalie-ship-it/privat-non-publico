import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:3001/api";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      associationId: string;
    }>;
  },
) {
  try {
    const {
      associationId,
    } = await params;

    const authorization =
      request.headers.get("authorization");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    const backendUrl =
      `${BACKEND_URL}/events/association/${associationId}`;

    console.log(
      "Proxy GET eventi:",
      backendUrl,
    );

    const response = await fetch(
      backendUrl,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const contentType =
      response.headers.get("content-type") ?? "";

    let data: unknown = null;

    if (
      contentType.includes(
        "application/json",
      )
    ) {
      data = await response
        .json()
        .catch(() => null);
    } else {
      data = await response
        .text()
        .catch(() => null);
    }

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "Proxy GET eventi associazione:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Backend non raggiungibile",
      },
      {
        status: 502,
      },
    );
  }
}