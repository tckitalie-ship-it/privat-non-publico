import { API_URL, clearAccessToken, getAccessToken } from '@/lib/api';

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type AuthUser = {
  id: string;
  email: string;
  associationId?: string | null;
  role?: UserRole | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      clearAccessToken();
      return null;
    }

    return await res.json();
  } catch {
    clearAccessToken();
    return null;
  }
}

export function canManageMembers(role?: UserRole | string | null) {
  return role === 'OWNER' || role === 'ADMIN';
}

export function canManageBilling(role?: UserRole | string | null) {
  return role === 'OWNER';
}

export function canManageSettings(role?: UserRole | string | null) {
  return role === 'OWNER' || role === 'ADMIN';
}

export function canManageEvents(role?: UserRole | string | null) {
  return role === 'OWNER' || role === 'ADMIN';
}