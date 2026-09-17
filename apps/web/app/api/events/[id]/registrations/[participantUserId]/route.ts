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

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      participantUserId: string;
    }>;
  },
) {
  try {
    const { id, participantUserId } = await params;
    const token = await getToken(req);

    if (!token) {
      return NextResponse.json(
        { message: "Missing JWT token" },
        { status: 401 },
      );
    }

    const response = await fetch(
      getBackendApiUrl(
        `events/${id}/registrations/${participantUserId}`,
      ),
      {
        method: "DELETE",
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
      "Errore DELETE partecipante:",
      error,
    );

    return NextResponse.json(
      { message: "Errore interno" },
      { status: 500 },
    );
  }
}
