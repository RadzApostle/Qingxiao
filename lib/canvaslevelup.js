// lib/canvaslevelup.js — migrated from @napi-rs/canvas to sharp + SVG
import sharp from 'sharp'
import fs from 'fs'

const W = 934, H = 282
const AV_R = 75
const AV_CX = 120, AV_CY = 141
const AV_SIZE = AV_R * 2

// Escape XML special chars
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function canvasLevelUp(pp, username, before, after, role) {
  // Load avatar
  let avBuf
  try {
    if (Buffer.isBuffer(pp)) {
      avBuf = pp
    } else if (typeof pp === 'string' && fs.existsSync(pp)) {
      avBuf = fs.readFileSync(pp)
    } else {
      avBuf = pp
    }
  } catch {
    avBuf = fs.readFileSync('./src/avatar_contact.png')
  }

  // Round-clip avatar
  const mask = Buffer.from(
    `<svg><circle cx="${AV_R}" cy="${AV_R}" r="${AV_R}" fill="white"/></svg>`
  )
  const av = await sharp(avBuf)
    .resize(AV_SIZE, AV_SIZE)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  // Build base card via SVG — Qingxiao Botz red/gold theme
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d0d0d;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#1a0a0a;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)" rx="0"/>
  <!-- Inner card -->
  <rect x="15" y="15" width="904" height="252" rx="20" fill="#1a0a0a"/>
  <!-- Gold top accent bar -->
  <rect x="15" y="15" width="904" height="6" rx="3" fill="#d4af37"/>
  <!-- Red left accent -->
  <rect x="15" y="21" width="5" height="246" rx="2" fill="#c8102e"/>
  <!-- Avatar circle border -->
  <circle cx="${AV_CX}" cy="${AV_CY}" r="${AV_R + 4}" fill="none" stroke="#d4af37" stroke-width="4"/>
  <!-- Username -->
  <text x="230" y="90" font-family="sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF">${esc(username)}</text>
  <!-- LEVEL UP -->
  <text x="230" y="150" font-family="sans-serif" font-size="46" font-weight="bold" fill="#c8102e">LEVEL UP!</text>
  <!-- Level transition -->
  <text x="230" y="198" font-family="sans-serif" font-size="28" fill="#d4af37">Level ${esc(String(before))} → ${esc(String(after))}</text>
  <!-- Role -->
  <text x="230" y="240" font-family="sans-serif" font-size="22" fill="#B5BAC1">${esc(role)}</text>
  <!-- Qingxiao Botz watermark -->
  <text x="${W - 20}" y="${H - 12}" font-family="sans-serif" font-size="14" fill="#555" text-anchor="end">✦ Qingxiao Botz</text>
</svg>`

  const base = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  // Composite avatar onto card
  return await sharp(base)
    .composite([{ input: av, left: AV_CX - AV_R, top: AV_CY - AV_R }])
    .png()
    .toBuffer()
}
