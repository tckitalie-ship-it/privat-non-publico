import { getBackendApiUrl } from "@/lib/server-api";
import { NextResponse } from "next/server";



export async function GET(
  request: Request,
  context: {
    params: Promise<{
      associationId: string;
    }>;
  },
) {
  try {
    const { associationId } =
      await context.params;

    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      getBackendApiUrl(`finances/association/${associationId}`),
      {
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
            : "Errore caricamento transazioni",
      },
      {
        status: 500,
      },
    );
  }
}
