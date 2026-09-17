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

async function forwardRequest(
  req: Request,
  method: "POST" | "DELETE",
) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");

    const checkInIndex = parts.indexOf("check-in");
    const participantUserId = parts[checkInIndex - 1];
    const id = parts[checkInIndex - 3];

    const token = await getToken(req);

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 },
      );
    }

    const response = await fetch(
      getBackendApiUrl(
        `events/${id}/registrations/${participantUserId}/check-in`,
      ),
      {
        method,
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
    console.error(
      `Errore ${method} check-in partecipante:`,
      error,
    );

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return forwardRequest(req, "POST");
}

export async function DELETE(req: Request) {
  return forwardRequest(req, "DELETE");
}
