import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";



async function getToken() {
  const cookieStore = await cookies();

  return cookieStore
    .get("access_token")
    ?.value;
}

async function getData(
  response: Response,
) {
  return response.json().catch(() => null);
}

// -----------------------------------------------------
// GET /api/associations/:id
// Tutti i membri possono leggere l'associazione
// -----------------------------------------------------
export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        {
          message: "Missing JWT token",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      getBackendApiUrl(`associations/${id}`),
      {
        method: "GET",
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
      "Errore GET /associations/:id:",
      error,
    );

    return NextResponse.json(
      {
        message: "Errore interno",
      },
      {
        status: 500,
      },
    );
  }
}

// -----------------------------------------------------
// PATCH /api/associations/:id
// Il backend permette solo OWNER
// -----------------------------------------------------
export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const token = await getToken();
    const body = await req.json();

    if (!token) {
      return NextResponse.json(
        {
          message: "Missing JWT token",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      getBackendApiUrl(`associations/${id}`),
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await getData(response);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Errore PATCH /associations/:id:",
      error,
    );

    return NextResponse.json(
      {
        message: "Errore interno",
      },
      {
        status: 500,
      },
    );
  }
}

// -----------------------------------------------------
// DELETE /api/associations/:id
// Il backend permette solo OWNER
// -----------------------------------------------------
export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        {
          message: "Missing JWT token",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      getBackendApiUrl(`associations/${id}`),
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
      "Errore DELETE /associations/:id:",
      error,
    );

    return NextResponse.json(
      {
        message: "Errore interno",
      },
      {
        status: 500,
      },
    );
  }
}
