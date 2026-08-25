import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      associationId: string;
    }>;
  },
) {
  try {
    const { associationId } =
      await context.params;

    const headerAuthorization =
      request.headers.get("authorization");

    const cookieStore =
      await cookies();

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

    const response = await fetch(
      `${API_BASE_URL}/finances/summary/${associationId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const data =
      await response
        .json()
        .catch(() => null);

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "[FINANCE SUMMARY PROXY ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore caricamento riepilogo",
      },
      {
        status: 500,
      },
    );
  }
}
