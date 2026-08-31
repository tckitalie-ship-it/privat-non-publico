import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001/api"}/associations`;

// -----------------------------------------------------
// GET /api/associations
// -----------------------------------------------------
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 }
      );
    }

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Errore GET /associations:", error);
    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------
// POST /api/associations
// -----------------------------------------------------
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Errore POST /associations:", error);
    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 }
    );
  }
}








