import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = request.headers.get('authorization');
  const body = await request.json();
  const { id } = await context.params;

  const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = request.headers.get('authorization');
  const body = await request.json();
  const { id } = await context.params;

  const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
    method: 'DELETE',
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
