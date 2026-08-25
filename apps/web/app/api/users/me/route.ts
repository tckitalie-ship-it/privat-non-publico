import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = "http://127.0.0.1:3001/api/users/me";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function getData(response: Response) {
  return response.json().catch(() => null);
}

export async function GET() {
  try {
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 },
      );
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

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
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const response = await fetch(API_URL, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

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
