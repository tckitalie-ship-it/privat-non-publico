import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:3001/api/audit-log";

async function proxy(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get("access_token")?.value;
    const authorization = request.headers.get("authorization");

    const token = cookieToken
      ? `Bearer ${cookieToken}`
      : authorization;

    if (!token) {
      return NextResponse.json(
        { message: "Non autenticato" },
        { status: 401 }
      );
    }

    const pathname = request.nextUrl.pathname;
    const query = request.nextUrl.search;

    const suffix = pathname.replace("/api/audit-log", "");

    const targetUrl = `${API_URL}${suffix}${query}`;

    const headers = new Headers();

    headers.set("Authorization", token);
    headers.set("Accept", "application/json");

    const associationId =
      request.headers.get("x-association-id") ||
      request.nextUrl.searchParams.get("associationId");

    if (associationId) {
      headers.set("x-association-id", associationId);
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      cache: "no-store",
    });

    const body = await response.arrayBuffer();

    const responseHeaders = new Headers();

    responseHeaders.set(
      "Content-Type",
      response.headers.get("content-type") ||
        "application/json"
    );

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Audit log proxy error:", error);

    return NextResponse.json(
      {
        message:
          "Errore di comunicazione con il server Audit Log",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxy(request);
}

export async function POST(request: NextRequest) {
  return proxy(request);
}

export async function PATCH(request: NextRequest) {
  return proxy(request);
}

export async function DELETE(request: NextRequest) {
  return proxy(request);
}