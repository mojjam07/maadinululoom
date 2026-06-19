import fs from 'fs'
import path from 'path'

async function run() {
  const base = (process.env.VITE_SITE_URL as string) || 'https://maadinul.vercel.app'
  const routes = ['/', '/login', '/register', '/dashboard']

  const urls = routes.map(r => `  <url>\n    <loc>${base}${r}</loc>\n    <priority>${r==='/'? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`

  const out = path.join(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(out, xml, 'utf8')
  console.log('Wrote sitemap to', out)
}

run().catch((err) => {
  console.error('Sitemap generation failed:', err)
  process.exit(2)
})
