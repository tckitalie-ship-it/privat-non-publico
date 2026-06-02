import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'News Platform Association (NPA)',
    short_name: 'NPA',
    description:
      'Piattaforma moderna per la gestione di associazioni, membri, eventi, finanze e comunicazioni.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f1117',
    theme_color: '#4f46e5',
  };
}