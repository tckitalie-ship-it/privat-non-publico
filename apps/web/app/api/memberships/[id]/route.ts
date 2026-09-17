import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/server-api";

async function getToken(request: Request) {
  const cookieStore = await cookies();

  const cookieToken =
    cookieStore.get("access_token")?.value;

  const headerAuthorization =
    request.headers.get("authorization");

  return (
    cookieToken ??
    headerAuthorization?.replace(/^Bearer\s+/i, "") ??
    null
  );
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const token = await getToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const associationId =
      request.headers.get("x-association-id");

    const body = await request.json();

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      getBackendApiUrl(`memberships/${id}`),
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(
      data ?? {},
      { status: response.status },
    );
  } catch (error) {
    console.error(
      "Errore PATCH /memberships/:id:",
      error,
    );

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const token = await getToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const associationId =
      request.headers.get("x-association-id");

    const headers: HeadersInit = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (associationId) {
      headers["x-association-id"] = associationId;
    }

    const response = await fetch(
      getBackendApiUrl(`memberships/${id}`),
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Errore DELETE /memberships/:id:",
      error,
    );

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}
