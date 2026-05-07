import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  const response = await fetch('http://127.0.0.1:3001/api/memberships', {
    method: 'GET',
    headers: {
      Authorization: authorization || '',
    },
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
