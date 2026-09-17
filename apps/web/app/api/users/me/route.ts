import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendApiUrl } from "@/lib/server-api";

async function getToken(req: Request) {
  const authorization = req.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function getData(response: Response) {
  return response.json().catch(() => null);
}

export async function GET(req: Request) {
  try {
    const token = await getToken(req);

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 },
      );
    }

    const response = await fetch(
      getBackendApiUrl("users/me"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await getData(response);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Errore GET /users/me:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const token = await getToken(req);

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const response = await fetch(
      getBackendApiUrl("users/me"),
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await getData(response);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Errore PATCH /users/me:", error);

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}
