import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = request.headers.get('authorization');
  const body = await request.json();

  const response = await fetch(
    'http://127.0.0.1:3000/api/auth/switch-association',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}
