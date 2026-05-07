import { apiFetch } from './api';

export async function getDashboardKpis() {
  const response = await apiFetch('/api/dashboard/kpis');

  if (!response.ok) {
    throw new Error('Errore nel caricamento dashboard');
  }

  return response.json();
}