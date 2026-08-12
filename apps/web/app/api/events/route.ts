import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/server-api';

const BACKEND_URL = getBackendApiUrl();

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
