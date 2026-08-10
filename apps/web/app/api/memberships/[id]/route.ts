import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const cookieToken =
      cookieStore.get("access_token")?.value;

    const headerAuthorization =
      request.headers.get("authorization");

    const authorization =
      headerAuthorization ??
      (cookieToken ? `Bearer ${cookieToken}` : null);

    if (!authorization) {
      return NextResponse.json(
        { message: "Sessione non disponibile" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/memberships/${id}`,
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
    console.error("Delete membership proxy error:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}
