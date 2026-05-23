import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Association SaaS Platform',
    short_name: 'Association',
    description: 'Piattaforma SaaS per associazioni',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f1117',
    theme_color: '#4f46e5',
  };
}