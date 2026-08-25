import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

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

export async function PATCH(
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

    const body =
      await request.json();

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type":
        "application/json",
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
        `${API_BASE_URL}/events/${id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(
            body,
          ),
          cache: "no-store",
        },
      );

    const data =
      await getResponseData(
        response,
      );

    console.log(
      "[EVENT PATCH]",
      response.status,
      data,
    );

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "[EVENT PATCH PROXY ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore modifica evento",
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
        `${API_BASE_URL}/events/${id}`,
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

    console.log(
      "[EVENT DELETE]",
      response.status,
      data,
    );

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "[EVENT DELETE PROXY ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore eliminazione evento",
      },
      {
        status: 500,
      },
    );
  }
}
