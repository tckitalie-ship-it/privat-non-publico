import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const authorization =
      request.headers.get("authorization");

    const body = await request.json();

    const response = await fetch(
      `${API_BASE_URL}/finances/${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore modifica transazione",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      `${API_BASE_URL}/finances/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore eliminazione transazione",
      },
      { status: 500 },
    );
  }
}
