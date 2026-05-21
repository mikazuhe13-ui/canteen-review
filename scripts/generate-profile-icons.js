const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', 'images', 'icons', 'profile')
const stroke = '#526072'
const primary = '#1677FF'
const accent = '#FFB020'

const icons = {
  posts: [
    '<path d="M24 22h36a10 10 0 0 1 10 10v34a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10Z"/>',
    '<path d="M30 38h24M30 52h32M30 66h18"/>'
  ],
  reviews: [
    '<path d="M20 27h56v42a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V27Z"/>',
    '<path d="M31 19h34M34 45h28M34 59h20"/>',
    '<path class="accent" d="m48 31 3.2 6.6 7.3 1.1-5.3 5.1 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1.1L48 31Z"/>'
  ],
  favorite: [
    '<path d="M48 76S20 60.5 20 38.5C20 28.5 27.5 22 36 22c5.2 0 9.5 2.5 12 6.5C50.5 24.5 54.8 22 60 22c8.5 0 16 6.5 16 16.5C76 60.5 48 76 48 76Z"/>'
  ],
  history: [
    '<path d="M24 30A29 29 0 1 1 18 48"/>',
    '<path d="M18 24v18h18"/>',
    '<path d="M48 32v18l13 8"/>'
  ],
  feedback: [
    '<path d="M19 22h58v39a9 9 0 0 1-9 9H45L30 80V70H28a9 9 0 0 1-9-9V22Z"/>',
    '<path d="M32 39h32M32 53h22"/>'
  ],
  lost: [
    '<path d="M27 31h42v38a8 8 0 0 1-8 8H35a8 8 0 0 1-8-8V31Z"/>',
    '<path d="M36 31v-4a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v4"/>',
    '<path class="accent" d="M48 47v10M48 65h.1"/>'
  ],
  coupon: [
    '<path d="M20 32h56v12a8 8 0 0 0 0 16v12H20V60a8 8 0 0 0 0-16V32Z"/>',
    '<path d="M48 35v7M48 51v7M48 67v5"/>',
    '<path d="M32 48h8M56 56h8"/>'
  ],
  invite: [
    '<circle cx="37" cy="38" r="12"/>',
    '<path d="M16 75c3-15 11-22 21-22s18 7 21 22"/>',
    '<path d="M62 30v18M53 39h18"/>'
  ],
  settings: [
    '<path d="M48 60a12 12 0 1 0 0-24 12 12 0 0 0 0 24Z"/>',
    '<path d="M48 17v9M48 70v9M22.5 31.5l7.8 4.5M65.7 60l7.8 4.5M22.5 64.5l7.8-4.5M65.7 36l7.8-4.5"/>',
    '<path d="M35 22.5 39.5 30M56.5 66 61 73.5M35 73.5 39.5 66M56.5 30 61 22.5"/>'
  ],
  about: [
    '<circle cx="48" cy="48" r="30"/>',
    '<path d="M48 45v18M48 33h.1"/>'
  ],
  admin: [
    '<path d="M48 14 74 26v20c0 17.5-10.8 28.5-26 38-15.2-9.5-26-20.5-26-38V26l26-12Z"/>',
    '<path d="M37 49l8 8 16-20"/>'
  ],
  ai: [
    '<path d="M23 27h50a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H49L34 80V69H23a8 8 0 0 1-8-8V35a8 8 0 0 1 8-8Z"/>',
    '<path class="primary" d="m48 34 3.5 8 8.5 3.5-8.5 3.5-3.5 8-3.5-8-8.5-3.5 8.5-3.5 3.5-8Z"/>'
  ]
}

function svg(paths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <style>
    path,circle{stroke:${stroke};stroke-width:5.2;stroke-linecap:round;stroke-linejoin:round}
    .primary{stroke:${primary}}
    .accent{stroke:${accent}}
  </style>
  ${paths.join('\n  ')}
</svg>
`
}

fs.mkdirSync(outDir, { recursive: true })
for (const [name, paths] of Object.entries(icons)) {
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg(paths))
}

console.log(`Generated ${Object.keys(icons).length} profile icons in ${outDir}`)
