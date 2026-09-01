import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";



export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await fetch(
      `${getBackendApiUrl("invitations/accept-and-register")}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
      },
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Invitation accept-and-register proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Backend non raggiungibile",
      },
      { status: 502 },
    );
  }
}
