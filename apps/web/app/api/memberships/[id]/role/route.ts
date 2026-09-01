import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/server-api";

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
    const cookieStore = await cookies();

    const cookieToken =
      cookieStore.get("access_token")?.value;

    const headerAuthorization =
      request.headers.get("authorization");

    const token =
      cookieToken ??
      headerAuthorization?.replace(/^Bearer\s+/i, "");

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
      getBackendApiUrl(`memberships/${id}/role`),
      {
        method: "PATCH",
        headers,
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
    console.error(
      "[MEMBERSHIP ROLE PATCH ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore aggiornamento ruolo",
      },
      { status: 500 },
    );
  }
}
