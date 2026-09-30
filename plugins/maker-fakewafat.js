/**
 * Fake WA Fat (Donasi) — Qingxiao Botz
 * Migrated: @napi-rs/canvas → sharp + SVG
 */
import sharp from 'sharp'
import axios from 'axios'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
  return Buffer.from(res.data)
}

async function makeRoundAvatar(buf, size) {
  const mask = Buffer.from(`<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`)
  return sharp(buf).resize(size, size).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
}

const handler = async (m, { conn, text }) => {
  try {
    const parts = (text || '').split('|').map(v => v.trim())
    if (parts.length < 2) return m.reply('Format: .fakewafat nama|nominal\nContoh: .fakewafat Traveler|50000')

    const [nama, nominal] = parts
    const ppUrl = parts[2] || null

    const W = 600, H = 200
    const AV = 80

    let avBuf = null
    if (ppUrl) {
      try {
        const raw = await getBuffer(ppUrl)
        avBuf = await makeRoundAvatar(raw, AV)
      } catch {}
    }

    const formattedNominal = Number(nominal.replace(/[^\d]/g, '')).toLocaleString('id-ID')

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#075E54"/>
      ${!avBuf ? `<circle cx="${AV/2 + 20}" cy="${H/2}" r="${AV/2}" fill="#128C7E"/>` : ''}
      <text x="${AV + 50}" y="85" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${esc(nama)}</text>
      <text x="${AV + 50}" y="118" font-family="sans-serif" font-size="16" fill="#25D366">Rp ${esc(formattedNominal)}</text>
      <text x="${AV + 50}" y="148" font-family="sans-serif" font-size="13" fill="rgba(255,255,255,0.6)">💸 Donasi via WhatsApp Pay</text>
      <text x="${W-16}" y="${H-10}" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.3)" text-anchor="end">✦ Qingxiao Botz</text>
    </svg>`

    const base = await sharp(Buffer.from(svg)).png().toBuffer()

    let result = base
    if (avBuf) {
      result = await sharp(base).composite([{ input: avBuf, left: 20, top: H / 2 - AV / 2 }]).png().toBuffer()
    }

    await conn.sendMessage(m.chat, { image: result }, { quoted: m })
  } catch (e) {
    throw e
  }
}

handler.help = ['fakewafat nama|nominal|url_pp']
handler.tags = ['maker']
handler.command = /^(fakewafat)$/i
handler.limit = true

export default handler
