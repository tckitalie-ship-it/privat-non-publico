import { getBackendApiUrl } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function POST(request: Request) {
  try {
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

    const body = await request.json();

    const response = await fetch(
      `${getBackendApiUrl("auth/switch-association")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);
    const nextResponse = NextResponse.json(data ?? {}, {
  status: response.status,
});

const newToken =
  data?.accessToken ??
  data?.access_token ??
  data?.token;

if (response.ok && newToken) {
  nextResponse.cookies.set("access_token", newToken, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

return nextResponse;
    
  } catch (error) {
    console.error("Switch association proxy error:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}
