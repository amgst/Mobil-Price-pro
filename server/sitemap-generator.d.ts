// Type declarations for sitemap-generator.js

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

interface Mobile {
  brand: string;
  slug: string;
  [key: string]: any;
}

interface Brand {
  slug: string;
  [key: string]: any;
}

export function generateSitemapEntries(mobiles: Mobile[], brands: Brand[]): SitemapEntry[];
export function generateSitemapXML(entries: SitemapEntry[]): string;