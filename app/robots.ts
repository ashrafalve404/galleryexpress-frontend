import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.ticketdorkar.xyz';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/agent/dashboard',
          '/agent/issue-ticket',
          '/agent/issued-tickets',
          '/agent/my-quotas',
          '/agent/verification',
          '/dashboard',
          '/checkout/',
          '/checkout/*',
          '/ticket/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
