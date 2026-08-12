import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server-api";

const API_BASE_URL = getBackendApiUrl();

async function getAuthorization(request: Request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("access_token")?.value;

  return (
    request.headers.get("authorization") ??
    (cookieToken ? `Bearer ${cookieToken}` : null)
  );
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    const authorization = await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
    });
  } catch (error) {
    console.error("Delete event proxy error:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await context.params;
    const authorization = await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
    });
  } catch (error) {
    console.error("Update event proxy error:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}
