import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_WRBT_API_BASE || 'http://localhost:5001';
  const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: frontendUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${frontendUrl}/schema`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // API endpoints for bot discovery
  const apiRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/api/healthz`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/api/documents`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/api/bots/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // TODO: Fetch public documents and add to sitemap
  // const documents = await fetch(`${baseUrl}/api/documents?limit=100`).then(r => r.json());
  // const documentRoutes = documents.documents.map(doc => ({
  //   url: `${frontendUrl}/documents/${doc.id}`,
  //   lastModified: new Date(doc.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));

  return [...staticRoutes, ...apiRoutes];
}
