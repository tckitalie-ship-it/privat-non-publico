import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAuthorization(request: Request) {
  const headerAuthorization =
    request.headers.get("authorization");

  if (headerAuthorization) {
    return headerAuthorization;
  }

  const cookieStore = await cookies();

  const cookieToken =
    cookieStore.get("access_token")?.value;

  return cookieToken
    ? `Bearer ${cookieToken}`
    : null;
}

async function getResponseData(response: Response) {
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
    const { id } = await context.params;

    const authorization =
      await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        {
          message: "Sessione non disponibile",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      getBackendApiUrl(`reminders/${id}/complete`),
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const data = await getResponseData(response);

    console.log(
      "[REMINDER PATCH]",
      response.status,
      data,
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "[REMINDER PATCH PROXY ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore completamento reminder",
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
    const { id } = await context.params;

    const authorization =
      await getAuthorization(request);

    if (!authorization) {
      return NextResponse.json(
        {
          message: "Sessione non disponibile",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      getBackendApiUrl(`reminders/${id}`),
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );

    const data = await getResponseData(response);

    console.log(
      "[REMINDER DELETE]",
      response.status,
      data,
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "[REMINDER DELETE PROXY ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore eliminazione reminder",
      },
      {
        status: 500,
      },
    );
  }
}
