import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";



async function getAuthorization(
  request: Request,
) {
  const headerAuthorization =
    request.headers.get("authorization");

  if (headerAuthorization) {
    return headerAuthorization;
  }

  const cookieStore = await cookies();

  const cookieToken =
    cookieStore
      .get("access_token")
      ?.value;

  return cookieToken
    ? `Bearer ${cookieToken}`
    : null;
}

async function getResponseData(
  response: Response,
) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } =
      await context.params;

    const authorization =
      await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        {
          message:
            "Sessione non disponibile",
        },
        {
          status: 401,
        },
      );
    }

    const associationId =
      request.headers.get(
        "x-association-id",
      );

    const headers: HeadersInit = {
      Accept: "application/json",
      Authorization:
        authorization,
    };

    if (associationId) {
      headers[
        "x-association-id"
      ] = associationId;
    }

    const response =
      await fetch(
        getBackendApiUrl(`events/${id}/register`),
        {
          method: "POST",
          headers,
          cache: "no-store",
        },
      );

    const data =
      await getResponseData(
        response,
      );

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "[EVENT REGISTER ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore registrazione evento",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } =
      await context.params;

    const authorization =
      await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        {
          message:
            "Sessione non disponibile",
        },
        {
          status: 401,
        },
      );
    }

    const associationId =
      request.headers.get(
        "x-association-id",
      );

    const headers: HeadersInit = {
      Accept: "application/json",
      Authorization:
        authorization,
    };

    if (associationId) {
      headers[
        "x-association-id"
      ] = associationId;
    }

    const response =
      await fetch(
        getBackendApiUrl(`events/${id}/register`),
        {
          method: "DELETE",
          headers,
          cache: "no-store",
        },
      );

    const data =
      await getResponseData(
        response,
      );

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "[EVENT UNREGISTER ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore annullamento partecipazione",
      },
      {
        status: 500,
      },
    );
  }
}
