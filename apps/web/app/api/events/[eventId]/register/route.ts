import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server-api";

const API_BASE_URL = getBackendApiUrl();

async function getAuthorization(request: Request) {
  const cookieStore = await cookies();
  const cookieToken =
    cookieStore.get("access_token")?.value;

  return (
    request.headers.get("authorization") ??
    (cookieToken ? `Bearer ${cookieToken}` : null)
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const authorization = await getAuthorization(request);

  if (!authorization) {
    return NextResponse.json(
      { message: "Sessione non disponibile" },
      { status: 401 },
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/events/${eventId}/register`,
    {
      method: "POST",
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
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  const authorization = await getAuthorization(request);

  if (!authorization) {
    return NextResponse.json(
      { message: "Sessione non disponibile" },
      { status: 401 },
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/events/${eventId}/register`,
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
}
