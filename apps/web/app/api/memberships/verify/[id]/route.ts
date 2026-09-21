import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const configuredUrl = "https://privat-non-publico-6kjd.onrender.com";
  const apiUrl = configuredUrl.replace(/\/+$/, "");

  const endpoint = `${apiUrl}/api/public/membership-verification/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        message: "Impossibile verificare la tessera",
      },
      { status: 502 },
    );
  }
}
