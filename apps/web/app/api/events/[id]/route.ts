import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:3001/api';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await context.params;

    const response = await fetch(
      `${API_BASE_URL}/events/${id}/register`,
      {
        method: 'POST',
        headers: {
          ...(token
            ? { Authorization: token }
            : {}),
        },
      },
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    console.log(
      '[EVENT REGISTER]',
      response.status,
      data,
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      '[EVENT REGISTER PROXY ERROR]',
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Errore proxy registrazione',
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await context.params;

    const response = await fetch(
      `${API_BASE_URL}/events/${id}/register`,
      {
        method: 'DELETE',
        headers: {
          ...(token
            ? { Authorization: token }
            : {}),
        },
      },
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    console.log(
      '[EVENT UNREGISTER]',
      response.status,
      data,
    );

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      '[EVENT UNREGISTER PROXY ERROR]',
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Errore proxy annullamento',
      },
      {
        status: 500,
      },
    );
  }
}