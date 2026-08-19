import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    if (!token) {
      return NextResponse.json(
        { message: "Token invito mancante" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();

    const authorization =
      request.headers.get("authorization") ??
      (() => {
        const accessToken =
          cookieStore.get("access_token")?.value;

        return accessToken
          ? `Bearer ${accessToken}`
          : null;
      })();

    if (!authorization) {
      return NextResponse.json(
        {
          message: "Authorization header mancante",
        },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${API_URL}/invitations/accept/${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "[INVITATIONS ACCEPT] proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Errore interno proxy invitations",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}