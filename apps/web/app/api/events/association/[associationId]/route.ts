import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/server-api";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ associationId: string }>;
  },
) {
  try {
    const { associationId } = await params;
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

    const response = await fetch(
      getBackendApiUrl(
        `events/association/${associationId}`,
      ),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data ?? [], {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Proxy GET eventi associazione:",
      error,
    );

    return NextResponse.json(
      { message: "Backend non raggiungibile" },
      { status: 502 },
    );
  }
}
