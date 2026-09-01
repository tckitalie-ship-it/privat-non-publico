import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://privat-non-publico.onrender.com/api";

function headersFrom(request: NextRequest) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const authorization = request.headers.get("authorization");
  const associationId = request.headers.get("x-association-id");

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (associationId) {
    headers["x-association-id"] = associationId;
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/invitations`, {
      method: "GET",
      headers: headersFrom(request),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy invitations GET:", error);

    return NextResponse.json(
      { message: "Backend non raggiungibile" },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/invitations`, {
      method: "POST",
      headers: {
        ...headersFrom(request),
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy invitations POST:", error);

    return NextResponse.json(
      { message: "Backend non raggiungibile" },
      { status: 502 },
    );
  }
}

