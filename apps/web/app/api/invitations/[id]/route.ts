import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:3001/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const authorization = request.headers.get("authorization");
    const associationId = request.headers.get("x-association-id");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      `${BACKEND_URL}/invitations/${id}`,
      {
        method: "DELETE",
        headers,
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Proxy DELETE invitation:", error);

    return NextResponse.json(
      { message: "Backend non raggiungibile" },
      { status: 502 },
    );
  }
}