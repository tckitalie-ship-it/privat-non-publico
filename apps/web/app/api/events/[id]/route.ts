import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = request.headers.get('authorization');
  const { id } = await context.params;

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, {
    status: response.status,
  });
}
