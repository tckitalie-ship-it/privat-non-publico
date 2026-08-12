import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/server-api';

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization');

    const response = await fetch(
      getBackendApiUrl('dashboard/finance-trend'),
      {
        headers: {
          Authorization: authorization || '',
        },
      },
    );

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: 'Errore durante il recupero del trend finanziario.',
      },
      {
        status: 500,
      },
    );
  }
}
