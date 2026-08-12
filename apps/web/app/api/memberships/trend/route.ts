import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/server-api';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  const response = await fetch(
    getBackendApiUrl('dashboard/members-trend'),
    {
      headers: {
        Authorization: authorization || '',
      },
    },
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}
