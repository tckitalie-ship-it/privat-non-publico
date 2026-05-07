export const API_URL = '/api';

export function setToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function getToken() {
  return localStorage.getItem('access_token');
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `Login failed: ${res.status}`);
  }

  return JSON.parse(text);
}

export async function getMemberships() {
  const token = getToken();

  const res = await fetch(`${API_URL}/memberships`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Errore memberships');
  }

  return res.json();
}

export async function switchAssociation(associationId: string) {
  const token = getToken();

  const res = await fetch(`${API_URL}/auth/switch-association`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ associationId }),
  });

  if (!res.ok) {
    throw new Error('Switch associazione fallito');
  }

  return res.json();
}

export async function createCheckout() {
  const token = getToken();

  const res = await fetch(`${API_URL}/billing/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Checkout fallito');
  }

  return res.json();
}