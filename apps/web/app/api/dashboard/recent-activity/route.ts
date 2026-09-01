import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";



export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("access_token")?.value ??
      request.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        {
          message: "Authorization header mancante",
          error: "Unauthorized",
          statusCode: 401,
        },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${getBackendApiUrl("dashboard/recent-activity")}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Errore proxy recent activity:", error);

    return NextResponse.json(
      {
        message: "Errore caricamento attività recenti",
      },
      { status: 500 },
    );
  }
}

