import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://privat-non-publico.onrender.com/api";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      token: string;
    }>;
  },
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        {
          message: "Token invito mancante",
        },
        {
          status: 400,
        },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/invitations/check/${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = text ? JSON.parse(text) : {};
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
      "Invitation check proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Backend non raggiungibile",
      },
      {
        status: 502,
      },
    );
  }
}