import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://privat-non-publico.onrender.com/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const authorization = request.headers.get("authorization");
    const associationId = request.headers.get("x-association-id");
    const accessToken = request.cookies.get("access_token")?.value;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    } else if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      `${BACKEND_URL}/invitations/${id}/resend`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy POST invitation resend:", error);

    return NextResponse.json(
      { message: "Backend non raggiungibile" },
      { status: 502 },
    );
  }
}
