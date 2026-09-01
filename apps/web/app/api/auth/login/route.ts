import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await response.text();

    let data: unknown = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // NestJS restituisce "accessToken".
    // Lo salviamo nel cookie che i proxy API del frontend
    // utilizzano per autenticare le richieste successive.
    if (
      response.ok &&
      typeof data === "object" &&
      data !== null &&
      "accessToken" in data &&
      typeof data.accessToken === "string"
    ) {
      nextResponse.cookies.set("access_token", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Login proxy error:", error);

    return NextResponse.json(
      {
        message: "API NestJS non raggiungibile",
      },
      {
        status: 500,
      },
    );
  }
}