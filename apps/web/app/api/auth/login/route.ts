import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Login proxy error:', error);

    return NextResponse.json(
      {
        message: 'API NestJS non raggiungibile',
      },
      { status: 500 },
    );
  }
}