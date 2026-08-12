import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/server-api';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      getBackendApiUrl('invitations/accept'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            request.headers.get('authorization') || '',
        },
        body: JSON.stringify(body),
      },
    );

    const text = await response.text();

    console.log('PROXY STATUS:', response.status);
    console.log('PROXY RESPONSE:', text);

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data, {
        status: response.status,
      });
    } catch {
      return NextResponse.json(
        {
          message: text || 'Risposta API non valida',
        },
        {
          status: response.status,
        },
      );
    }
  } catch (error) {
    console.error('PROXY ERROR:', error);

    return NextResponse.json(
      {
        message: 'Errore interno proxy invitations',
      },
      {
        status: 500,
      },
    );
  }
}
