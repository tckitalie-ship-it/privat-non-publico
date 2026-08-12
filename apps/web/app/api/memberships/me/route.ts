import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/server-api";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  const cookieToken =
    cookieStore.get("access_token")?.value;

  const headerAuthorization =
    request.headers.get("authorization");

  const authorization =
    headerAuthorization ||
    (cookieToken
      ? `Bearer ${cookieToken}`
      : "");

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

  const response = await fetch(
    getBackendApiUrl("memberships/me"),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}