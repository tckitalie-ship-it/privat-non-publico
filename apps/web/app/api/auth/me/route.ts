import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    const cookieHeader =
      request.headers.get("cookie");

    const accessToken = cookieHeader
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("access_token="))
      ?.split("=")
      .slice(1)
      .join("=");

    const finalAuthorization =
      authorization ??
      (accessToken
        ? `Bearer ${decodeURIComponent(accessToken)}`
        : null);

    const response = await fetch(
      `${getBackendApiUrl("auth/me")}`,
      {
        method: "GET",
        headers: {
          ...(finalAuthorization
            ? { Authorization: finalAuthorization }
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
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore caricamento profilo",
      },
      { status: 500 },
    );
  }
}
