import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await context.params;

    const authorization =
      request.headers.get("authorization");

    const associationId =
      request.headers.get("x-association-id");

    const response = await fetch(
      getBackendApiUrl(`files/${id}/download`),
      {
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
          ...(associationId
            ? { "x-association-id": associationId }
            : {}),
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const data =
        await response.json().catch(() => null);

      return NextResponse.json(data, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") ??
      "application/octet-stream";

    const contentDisposition =
      response.headers.get("content-disposition");

    const buffer =
      await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition
          ? {
              "Content-Disposition":
                contentDisposition,
            }
          : {}),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Errore download file",
      },
      { status: 500 },
    );
  }
}
