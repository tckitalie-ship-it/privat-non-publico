import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/server-api';

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(getBackendApiUrl('invitations/accept'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
