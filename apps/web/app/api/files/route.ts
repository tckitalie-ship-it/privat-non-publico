import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

function getHeaders(request: Request): Record<string, string> {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return {};
  }

  return {
    Authorization: authorization,
  };
}

export async function GET(request: Request) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/files`,
      {
        method: "GET",
        headers: getHeaders(request),
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
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
    const authorization =
      request.headers.get("authorization");

    const formData = await request.formData();

    const response = await fetch(
      `${API_BASE_URL}/files/upload`,
      {
        method: "POST",
        headers: authorization
          ? { Authorization: authorization }
          : {},
        body: formData,
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
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
