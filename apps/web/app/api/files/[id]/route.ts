import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();

    const cookieToken =
      cookieStore.get("access_token")?.value;

    const authorization =
      request.headers.get("authorization");

    const associationId =
      request.headers.get("x-association-id");

    const response = await fetch(
      getBackendApiUrl(`files/${id}`),
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : cookieToken
              ? { Authorization: `Bearer ${cookieToken}` }
              : {}),
          ...(associationId
            ? { "x-association-id": associationId }
            : {}),
        },
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
      "DELETE /api/files/[id]:",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore eliminazione file",
      },
      { status: 500 },
    );
  }
}
