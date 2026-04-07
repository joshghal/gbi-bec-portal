import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/helpdesk', '/kabar', '/kom', '/formulir', '/saran', '/tanya-jawab'],
        disallow: [
          '/admin',
          '/api',
          '/promo',
          '/sorotan',
          '/presentasi',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
