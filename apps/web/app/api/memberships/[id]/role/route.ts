import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

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

    const headerAuthorization =
      request.headers.get("authorization");

    const cookieToken =
      cookieStore
        .get("access_token")
        ?.value;

    const authorization =
      headerAuthorization ??
      (cookieToken
        ? `Bearer ${cookieToken}`
        : null);

    if (!authorization) {
      return NextResponse.json(
        {
          message:
            "Sessione non disponibile",
        },
        {
          status: 401,
        },
      );
    }

    const associationId =
      request.headers.get(
        "x-association-id",
      );

    const body = await request.json();

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type":
        "application/json",
      Authorization: authorization,
    };

    if (associationId) {
      headers["x-association-id"] =
        associationId;
    }

    const response = await fetch(
      `${API_BASE_URL}/memberships/${id}/role`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data =
      await response
        .json()
        .catch(() => null);

    console.log(
      "[MEMBERSHIP ROLE PATCH]",
      response.status,
      data,
    );

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
      {
        status: 500,
      },
    );
  }
}
