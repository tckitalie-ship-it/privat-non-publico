import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

export async function GET(request: Request) {
  const token = request.headers.get('authorization');

  const response = await fetch(`${API_BASE_URL}/events`, {
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization');
  const body = await request.json();

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}