import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

function getHeaders(request: Request) {
  const authorization =
    request.headers.get("authorization");

  return {
    Accept: "application/json",
    ...(authorization
      ? { Authorization: authorization }
      : {}),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${API_BASE_URL}/notifications`,
      {
        method: "POST",
        headers: {
          ...getHeaders(request),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore creazione notifica",
      },
      { status: 500 },
    );
  }
}
