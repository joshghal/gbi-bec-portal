import type { MetadataRoute } from 'next';
import { getAdminFirestore } from '@/lib/firebase-admin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gbibec.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/helpdesk`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/kabar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/kom`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/ibadah-raya`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/mclass`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/baptisan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/penyerahan-anak`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/pemberkatan-nikah`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/creative-ministry`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/formulir`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/tanya-jawab`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/saran`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...['100', '200', '300', '400'].map((level) => ({
      url: `${siteUrl}/kom/${level}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
  ];

  // Dynamic kabar pages
  let kabarPages: MetadataRoute.Sitemap = [];
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('updates')
      .where('published', '==', true)
      .get();

    kabarPages = snapshot.docs
      .filter((doc) => doc.data().slug)
      .map((doc) => {
        const data = doc.data();
        return {
          url: `${siteUrl}/kabar/${data.slug}`,
          lastModified: data.updatedAt ? new Date(data.updatedAt) : new Date(data.date),
          changeFrequency: 'daily' as const,
          priority: 1,
        };
      });
  } catch (error) {
    console.error('Sitemap: failed to fetch updates', error);
  }

  return [...staticPages, ...kabarPages];
}
