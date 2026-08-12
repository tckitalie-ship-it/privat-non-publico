import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/server-api";

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      getBackendApiUrl("dashboard/members-trend"),
      {
        headers: {
          Authorization: authorization || "",
        },
        cache: "no-store",
      },
    );

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(
      "Errore proxy members trend:",
      error,
    );

    return NextResponse.json(
      {
        message: "Errore members trend",
      },
      {
        status: 500,
      },
    );
  }
}
