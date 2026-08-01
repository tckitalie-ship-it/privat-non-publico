import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:3001/api';

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/events`, {
      method: 'GET',
      headers: {
        Authorization: authorization ?? '',
      },
      cache: 'no-store',
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: 'Errore durante il recupero degli eventi.',
      },
      {
        status: 500,
      },
    );
  }
}
export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
      },
      body,
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: 'Errore durante la creazione dell\'evento.',
      },
      {
        status: 500,
      },
    );
  }
}