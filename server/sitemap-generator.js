// Server-side sitemap generator

export function generateSitemapEntries(mobiles, brands) {
  const baseUrl = 'https://mobile-price.com';
  const entries = [];
  
  // Home page
  entries.push({
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0
  });
  
  // Brand pages
  brands.forEach(brand => {
    entries.push({
      loc: `${baseUrl}/${brand.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    });
  });
  
  // Mobile detail pages
  mobiles.forEach(mobile => {
    entries.push({
      loc: `${baseUrl}/${mobile.brand.toLowerCase()}/${mobile.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9
    });
  });
  
  // Static pages
  const staticPages = [
    { path: '/brands', priority: 0.7 },
    { path: '/search', priority: 0.6 },
    { path: '/compare', priority: 0.6 }
  ];
  
  staticPages.forEach(page => {
    entries.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: page.priority
    });
  });
  
  return entries;
}

export function generateSitemapXML(entries) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urls = entries.map(entry => {
    return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join('\n');
  
  return `${xmlHeader}\n${urlsetOpen}\n${urls}\n${urlsetClose}`;
}