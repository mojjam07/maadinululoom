const fs = require('fs');
const path = require('path');

const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'http://localhost:5173';
const routes = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/courses',
  '/contact'
];

const urls = routes.map(r => `${siteUrl.replace(/\/$/, '')}${r}`);
const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`).join('\n') +
  `\n</urlset>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml, 'utf8');
console.log('Wrote public/sitemap.xml');
