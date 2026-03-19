import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GBI Baranangsiang Evening Church',
    short_name: 'GBI BEC',
    description: 'Helpdesk & informasi GBI Baranangsiang Evening Church',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f0e8',
    theme_color: '#f5f0e8',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
