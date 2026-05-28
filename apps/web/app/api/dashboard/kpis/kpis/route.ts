import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization');

  const response = await fetch(
    'http://127.0.0.1:3000/api/dashboard/kpis',
    {
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}