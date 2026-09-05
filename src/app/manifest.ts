import { MetadataRoute } from 'next';
import { ORG } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ORG.name,
    short_name: ORG.shortName ?? 'GBT',
    description: ORG.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a2318',
    theme_color: '#0a2318',
    categories: ['education', 'social', 'nonprofit'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Join GBT',
        short_name: 'Join',
        description: 'Apply to become a GBT volunteer',
        url: '/join',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Our Programs',
        short_name: 'Programs',
        description: 'Explore GBT volunteer programs',
        url: '/programs',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
