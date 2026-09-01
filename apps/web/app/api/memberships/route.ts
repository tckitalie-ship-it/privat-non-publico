import { getBackendApiUrl } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function GET(
  request: Request,
) {
  try {
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

    const headers: HeadersInit = {
      Accept: "application/json",
      Authorization: authorization,
    };

    if (associationId) {
      headers["x-association-id"] =
        associationId;
    }

    const response = await fetch(
      `${getBackendApiUrl("memberships")}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const data =
      await response
        .json()
        .catch(() => null);

    return NextResponse.json(
      data ?? [],
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "Memberships proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "API NestJS non raggiungibile",
      },
      {
        status: 500,
      },
    );
  }
}

