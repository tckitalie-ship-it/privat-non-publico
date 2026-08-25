import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

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

    const cookieStore = await cookies();

    const headerAuthorization =
      request.headers.get("authorization");

    const cookieToken =
      cookieStore.get("access_token")?.value;

    const authorization =
      headerAuthorization ??
      (cookieToken
        ? `Bearer ${cookieToken}`
        : null);

    if (!authorization) {
      return NextResponse.json(
        {
          message: "Sessione non disponibile",
        },
        {
          status: 401,
        },
      );
    }

    const associationId =
      request.headers.get("x-association-id");

    const headers: HeadersInit = {
      Accept: "application/json",
      Authorization: authorization,
    };

    if (associationId) {
      headers["x-association-id"] =
        associationId;
    }

    const response = await fetch(
      `${API_BASE_URL}/memberships/${id}`,
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
      {
        message: "Errore interno",
      },
      {
        status: 500,
      },
    );
  }
}
