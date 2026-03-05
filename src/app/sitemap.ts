import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${siteUrl}/competitive`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/recreational`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/register`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/camps-and-events`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/tryouts`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/contact`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${siteUrl}/team`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${siteUrl}/gallery`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${siteUrl}/staff`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/achievements`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/facility`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },
    { url: `${siteUrl}/store`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${siteUrl}/alumni`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/prospects`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${siteUrl}/sponsors`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/employment`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/resources`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
