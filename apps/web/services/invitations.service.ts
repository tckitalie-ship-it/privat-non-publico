import { API_URL, getAccessToken } from '@/lib/api';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  status?: string;
  associationId?: string;
  createdAt?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Token di accesso mancante');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchInvitations(
  associationId: string,
): Promise<Invitation[]> {
  const response = await fetch(
    `${API_URL}/invitations?associationId=${encodeURIComponent(associationId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || `Errore caricamento inviti: ${response.status}`,
    );
  }

  return response.json();
}

export async function deleteInvitation(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/invitations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || `Errore eliminazione invito: ${response.status}`,
    );
  }
}