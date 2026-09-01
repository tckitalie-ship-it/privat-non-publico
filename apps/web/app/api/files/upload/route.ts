import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    const associationId =
      request.headers.get("x-association-id");

    const formData = await request.formData();

    const response = await fetch(
      getBackendApiUrl("files/upload"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
          ...(associationId
            ? { "x-association-id": associationId }
            : {}),
        },
        body: formData,
        cache: "no-store",
      },
    );

    const data =
      await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Errore proxy upload file:",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore caricamento file",
      },
      { status: 500 },
    );
  }
}
