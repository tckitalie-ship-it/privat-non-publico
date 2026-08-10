import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001/api";

async function getAuthorization(request: Request) {
  const cookieStore = await cookies();

  const cookieToken =
    cookieStore.get("access_token")?.value;

  return (
    request.headers.get("authorization") ??
    (cookieToken ? `Bearer ${cookieToken}` : null)
  );
}

export async function GET(request: Request) {
  const authorization = await getAuthorization(request);

  const response = await fetch(
    `${API_BASE_URL}/invitations`,
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

  const data = await response.json().catch(() => []);

  return NextResponse.json(data, {
    status: response.status,
  });
}

export async function POST(request: Request) {
  const authorization = await getAuthorization(request);

  const body = await request.json();

  const response = await fetch(
    `${API_BASE_URL}/invitations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization
          ? { Authorization: authorization }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, {
    status: response.status,
  });
}
