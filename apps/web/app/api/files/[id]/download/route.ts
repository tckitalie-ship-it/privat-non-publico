import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

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

    const response = await fetch(
      `${API_BASE_URL}/files/${id}/download`,
      {
        method: "GET",
        headers: authorization
          ? { Authorization: authorization }
          : {},
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      return NextResponse.json(data, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") ??
      "application/octet-stream";

    const contentDisposition =
      response.headers.get("content-disposition");

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition
          ? {
              "Content-Disposition": contentDisposition,
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
