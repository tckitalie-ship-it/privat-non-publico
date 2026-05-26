const API_BASE_URL = 'http://127.0.0.1:3000/api';

export async function GET(request: Request) {
  const token = request.headers.get('authorization');

  const response = await fetch(`${API_BASE_URL}/finances/export.xlsx`, {
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
  });

  const blob = await response.blob();

  return new Response(blob, {
    status: response.status,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="finances.xlsx"',
    },
  });
}
