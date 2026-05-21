const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const size = 96
const outDir = path.join(__dirname, '..', 'images', 'tabbar')
const inactive = '#8A8F98'
const active = '#2F6FED'
const accent = '#FFB020'

function hexToRgba(hex, alpha = 255) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha]
}

function makeCanvas() {
  return new Uint8Array(size * size * 4)
}

function blendPixel(img, x, y, color) {
  x = Math.round(x)
  y = Math.round(y)
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  const a = color[3] / 255
  const inv = 1 - a
  img[i] = Math.round(color[0] * a + img[i] * inv)
  img[i + 1] = Math.round(color[1] * a + img[i + 1] * inv)
  img[i + 2] = Math.round(color[2] * a + img[i + 2] * inv)
  img[i + 3] = Math.min(255, Math.round(color[3] + img[i + 3] * inv))
}

function dot(img, x, y, radius, color) {
  const r2 = radius * radius
  for (let yy = Math.floor(y - radius); yy <= Math.ceil(y + radius); yy++) {
    for (let xx = Math.floor(x - radius); xx <= Math.ceil(x + radius); xx++) {
      const dx = xx - x
      const dy = yy - y
      if (dx * dx + dy * dy <= r2) blendPixel(img, xx, yy, color)
    }
  }
}

function line(img, x1, y1, x2, y2, width, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps
    dot(img, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color)
  }
}

function polyline(img, points, width, color) {
  for (let i = 0; i < points.length - 1; i++) {
    line(img, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], width, color)
  }
}

function circle(img, cx, cy, radius, width, color) {
  const steps = Math.ceil(radius * 8)
  let prev = null
  for (let i = 0; i <= steps; i++) {
    const a = (Math.PI * 2 * i) / steps
    const p = [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]
    if (prev) line(img, prev[0], prev[1], p[0], p[1], width, color)
    prev = p
  }
}

function filledCircle(img, cx, cy, radius, color) {
  dot(img, cx, cy, radius, color)
}

function rect(img, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) blendPixel(img, xx, yy, color)
  }
}

function roundedRect(img, x, y, w, h, r, width, color) {
  line(img, x + r, y, x + w - r, y, width, color)
  line(img, x + r, y + h, x + w - r, y + h, width, color)
  line(img, x, y + r, x, y + h - r, width, color)
  line(img, x + w, y + r, x + w, y + h - r, width, color)
  arc(img, x + r, y + r, r, Math.PI, Math.PI * 1.5, width, color)
  arc(img, x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2, width, color)
  arc(img, x + w - r, y + h - r, r, 0, Math.PI * 0.5, width, color)
  arc(img, x + r, y + h - r, r, Math.PI * 0.5, Math.PI, width, color)
}

function arc(img, cx, cy, radius, start, end, width, color) {
  const steps = Math.ceil(radius * 3)
  let prev = null
  for (let i = 0; i <= steps; i++) {
    const a = start + ((end - start) * i) / steps
    const p = [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]
    if (prev) line(img, prev[0], prev[1], p[0], p[1], width, color)
    prev = p
  }
}

function filledRoundedRect(img, x, y, w, h, r, color) {
  rect(img, x + r, y, w - r * 2, h, color)
  rect(img, x, y + r, w, h - r * 2, color)
  filledCircle(img, x + r, y + r, r, color)
  filledCircle(img, x + w - r - 1, y + r, r, color)
  filledCircle(img, x + r, y + h - r - 1, r, color)
  filledCircle(img, x + w - r - 1, y + h - r - 1, r, color)
}

function polygon(img, points, color) {
  const minY = Math.floor(Math.min(...points.map(p => p[1])))
  const maxY = Math.ceil(Math.max(...points.map(p => p[1])))
  for (let y = minY; y <= maxY; y++) {
    const nodes = []
    let j = points.length - 1
    for (let i = 0; i < points.length; i++) {
      const pi = points[i]
      const pj = points[j]
      if ((pi[1] < y && pj[1] >= y) || (pj[1] < y && pi[1] >= y)) {
        nodes.push(pi[0] + ((y - pi[1]) / (pj[1] - pi[1])) * (pj[0] - pi[0]))
      }
      j = i
    }
    nodes.sort((a, b) => a - b)
    for (let k = 0; k < nodes.length; k += 2) {
      for (let x = Math.floor(nodes[k]); x <= Math.ceil(nodes[k + 1]); x++) blendPixel(img, x, y, color)
    }
  }
}

function pngChunk(type, data) {
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write(type, 4)
  data.copy(chunk, 8)
  const crc = crc32(Buffer.concat([Buffer.from(type), data]))
  chunk.writeUInt32BE(crc, 8 + data.length)
  return chunk
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function savePng(name, img) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    Buffer.from(img.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ])
  fs.writeFileSync(path.join(outDir, name), png)
}

function iconFeed(img, c, on) {
  roundedRect(img, 22, 25, 52, 42, 14, 6, c)
  polyline(img, [[38, 67], [31, 78], [48, 68]], 6, c)
  line(img, 36, 42, 60, 42, 5, c)
  line(img, 36, 54, 52, 54, 5, c)
  if (on) filledCircle(img, 68, 24, 7, hexToRgba(accent))
}

function iconRanking(img, c, on) {
  roundedRect(img, 22, 22, 52, 56, 12, 6, c)
  line(img, 34, 62, 34, 50, 7, c)
  line(img, 48, 62, 48, 40, 7, c)
  line(img, 62, 62, 62, 30, 7, c)
  if (on) filledCircle(img, 62, 30, 6, hexToRgba(accent))
}

function iconCanteen(img, c, on) {
  arc(img, 48, 47, 24, 0, Math.PI, 6, c)
  line(img, 22, 48, 74, 48, 6, c)
  arc(img, 48, 48, 24, 0, Math.PI, 6, c)
  roundedRect(img, 28, 48, 40, 22, 6, 6, c)
  line(img, 32, 26, 32, 40, 5, c)
  line(img, 46, 22, 46, 38, 5, c)
  line(img, 60, 26, 60, 40, 5, c)
  if (on) filledCircle(img, 58, 55, 7, hexToRgba(accent))
}

function iconProfile(img, c, on) {
  circle(img, 48, 36, 15, 6, c)
  arc(img, 48, 75, 28, Math.PI * 1.12, Math.PI * 1.88, 6, c)
  if (on) filledCircle(img, 62, 32, 5, hexToRgba(accent))
}

function iconAdmin(img, c, on) {
  polygon(img, [[48, 16], [70, 25], [66, 59], [48, 78], [30, 59], [26, 25]], on ? hexToRgba('#EAF2FF') : hexToRgba('#F4F5F7'))
  polyline(img, [[48, 16], [70, 25], [66, 59], [48, 78], [30, 59], [26, 25], [48, 16]], 6, c)
  polyline(img, [[36, 48], [45, 57], [62, 38]], 6, c)
  if (on) filledCircle(img, 48, 16, 5, hexToRgba(accent))
}

const icons = [
  ['feed', iconFeed],
  ['ranking', iconRanking],
  ['canteen', iconCanteen],
  ['profile', iconProfile],
  ['admin', iconAdmin]
]

fs.mkdirSync(outDir, { recursive: true })
for (const [name, draw] of icons) {
  let img = makeCanvas()
  draw(img, hexToRgba(inactive), false)
  savePng(`${name}.png`, img)
  img = makeCanvas()
  draw(img, hexToRgba(active), true)
  savePng(`${name}-active.png`, img)
}

console.log(`Generated ${icons.length * 2} tabbar icons in ${outDir}`)
