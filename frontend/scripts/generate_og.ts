import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

async function run() {
  const svgPath = path.join(process.cwd(), 'public', 'og-image.svg')
  const outPath = path.join(process.cwd(), 'public', 'og-image.png')

  if (!fs.existsSync(svgPath)) {
    console.error('SVG source not found:', svgPath)
    process.exit(1)
  }

  const svg = fs.readFileSync(svgPath)

  await sharp(svg)
    .resize(1200, 630, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(outPath)

  console.log('Generated OG image at', outPath)
}

run().catch((err) => {
  console.error('OG generation failed:', err)
  process.exit(2)
})
