import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(
      'http://127.0.0.1:3001/api/auth/switch-association',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      },
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Switch association proxy error:', error);

    return NextResponse.json(
      {
        message: 'Impossibile contattare il backend',
      },
      {
        status: 500,
      },
    );
  }
}