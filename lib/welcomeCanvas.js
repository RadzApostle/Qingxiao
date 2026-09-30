// lib/welcomeCanvas.js — migrated from @napi-rs/canvas to sharp + SVG
// Qingxiao Botz — Welcome Canvas
import sharp from 'sharp'
import fs from 'fs'
import axios from 'axios'

const W = 1000, H = 560
const BG_PATHS = [
  './src/Aesthetic/welcome-bg.jpg',
  '/home/container/src/Aesthetic/welcome-bg.jpg'
]
const DEFAULT_PP_PATHS = [
  './src/avatar_contact.png',
  '/home/container/src/avatar_contact.png'
]

function findFile(paths) {
  for (const p of paths) if (fs.existsSync(p)) return p
  return null
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function unicodeToAscii(str) {
  const ranges = [
    [0x1D400, 0x1D419, 65], [0x1D41A, 0x1D433, 97],
    [0x1D434, 0x1D44D, 65], [0x1D44E, 0x1D467, 97]
  ]
  return [...(str || '')].map(c => {
    const cp = c.codePointAt(0)
    for (const [start, end, base] of ranges) {
      if (cp >= start && cp <= end) return String.fromCharCode(base + (cp - start))
    }
    return c
  }).join('')
}

function cleanText(str, max = 25) {
  let s = unicodeToAscii(str || '').trim()
  return s.length > max ? s.slice(0, max) + '...' : s
}

async function loadAvatar(avatarUrl) {
  const AV = 190 // diameter
  const R = AV / 2

  let avBuf
  try {
    if (avatarUrl) {
      const res = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 12000 })
      avBuf = Buffer.from(res.data)
    } else throw new Error('no url')
  } catch {
    const fallback = findFile(DEFAULT_PP_PATHS)
    avBuf = fallback ? fs.readFileSync(fallback) : null
  }

  if (!avBuf) return null

  const mask = Buffer.from(
    `<svg><circle cx="${R}" cy="${R}" r="${R}" fill="white"/></svg>`
  )
  return await sharp(avBuf)
    .resize(AV, AV)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

async function buildCard(data, mode) {
  const isWelcome = mode === 'welcome'
  const groupName = cleanText(data.groupName, 28)
  const userName = cleanText(data.name, 20)
  const subText = isWelcome ? 'WELCOME TO THE GROUP' : 'SEE YOU AGAIN'
  const mainText = isWelcome ? 'WELCOME' : 'GOODBYE'
  const countText = isWelcome ? `Member #${data.count}` : `${data.count} members left`
  const accentColor = isWelcome ? '#d4af37' : '#c8102e'

  // Build background
  let bgBuf
  const bgPath = findFile(BG_PATHS)
  if (bgPath) {
    bgBuf = await sharp(fs.readFileSync(bgPath)).resize(W, H).toBuffer()
  } else {
    // Fallback: dark gradient via SVG
    const bgSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0d0505"/>
          <stop offset="100%" style="stop-color:#1a0a0a"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
    </svg>`
    bgBuf = await sharp(Buffer.from(bgSvg)).png().toBuffer()
  }

  // Dark overlay
  const overlaySvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.5)"/>
    <!-- Top bar -->
    <rect x="0" y="0" width="${W}" height="6" fill="${accentColor}"/>
    <!-- Bottom bar -->
    <rect x="0" y="${H - 6}" width="${W}" height="6" fill="${accentColor}"/>
    <!-- Group name -->
    <text x="${W / 2}" y="90" font-family="sans-serif" font-size="26" font-weight="bold"
      fill="#ffffff" text-anchor="middle">${esc(groupName)}</text>
    <!-- Sub text -->
    <text x="${W / 2}" y="130" font-family="sans-serif" font-size="17"
      fill="rgba(255,255,255,0.7)" text-anchor="middle">${esc(subText)}</text>
    <!-- Avatar ring outer -->
    <circle cx="${W / 2}" cy="285" r="108" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="14"/>
    <!-- Avatar ring inner -->
    <circle cx="${W / 2}" cy="285" r="99" fill="none" stroke="#ffffff" stroke-width="5"/>
    <!-- Accent ring -->
    <circle cx="${W / 2}" cy="285" r="95" fill="none" stroke="${accentColor}" stroke-width="2"/>
    <!-- WELCOME/GOODBYE text -->
    <text x="${W / 2}" y="430" font-family="sans-serif" font-size="48" font-weight="bold"
      fill="${accentColor}" text-anchor="middle">${esc(mainText)}</text>
    <!-- Username -->
    <text x="${W / 2}" y="472" font-family="sans-serif" font-size="26" font-weight="bold"
      fill="rgba(255,255,255,0.9)" text-anchor="middle">${esc(userName)}</text>
    <!-- Member count -->
    <text x="${W / 2}" y="508" font-family="sans-serif" font-size="17"
      fill="rgba(255,255,255,0.6)" text-anchor="middle">${esc(countText)}</text>
    <!-- Watermark -->
    <text x="${W - 16}" y="${H - 16}" font-family="sans-serif" font-size="13"
      fill="rgba(255,255,255,0.3)" text-anchor="end">✦ Qingxiao Botz</text>
  </svg>`

  const overlayBuf = await sharp(Buffer.from(overlaySvg)).png().toBuffer()

  // Composite overlay on bg
  let composite = await sharp(bgBuf)
    .composite([{ input: overlayBuf }])
    .png()
    .toBuffer()

  // Load and composite avatar
  const av = await loadAvatar(data.avatarUrl)
  if (av) {
    const AV = 190
    composite = await sharp(composite)
      .composite([{ input: av, left: Math.round(W / 2 - AV / 2), top: 285 - AV / 2 }])
      .png()
      .toBuffer()
  }

  return composite
}

export const createWelcomeCanvas = async (data) => buildCard(data, 'welcome')
export const createGoodbyeCanvas = async (data) => buildCard(data, 'goodbye')
