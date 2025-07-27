export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

export const sitemapUrls: SitemapUrl[] = [
  {
    url: 'https://www.yuthub.com',
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    url: 'https://www.yuthub.com/pricing',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.9,
  },
  {
    url: 'https://www.yuthub.com/features',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    url: 'https://www.yuthub.com/about',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    url: 'https://www.yuthub.com/contact',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    url: 'https://www.yuthub.com/privacy',
    lastmod: new Date().toISOString(),
    changefreq: 'yearly',
    priority: 0.4,
  },
  {
    url: 'https://www.yuthub.com/terms',
    lastmod: new Date().toISOString(),
    changefreq: 'yearly',
    priority: 0.4,
  },
  {
    url: 'https://www.yuthub.com/cookies',
    lastmod: new Date().toISOString(),
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    url: 'https://www.yuthub.com/accessibility',
    lastmod: new Date().toISOString(),
    changefreq: 'yearly',
    priority: 0.3,
  },
];

export function generateSitemap(): string {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    url => `  <url>
    <loc>${url.url}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
}
