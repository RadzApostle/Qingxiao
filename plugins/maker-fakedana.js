/**
 * Fake Dana Balance — Qingxiao Botz
 * Migrated: @napi-rs/canvas → sharp + SVG
 */

import sharp from 'sharp'
import axios from 'axios'

const BG_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Image/_20260501192538912.jpg'

// Config matching original canvas positions
const CONFIG = {
  rp: { x: 70, y: 62, fontSize: 19, color: '#a9e6ff' },
  saldo: { x: 101, y: 53, fontSize: 29, color: '#FFFFFF' }
}

function formatNumber(num) {
  return Number(num).toLocaleString('id-ID')
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function fetchBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
  return Buffer.from(res.data)
}

const handler = async (m, { conn, text }) => {
  try {
    if (!text) throw 'Contoh:\n.fakedana 150000'

    const raw = Number(text.replace(/[^\d]/g, ''))
    if (!raw || isNaN(raw)) throw 'Nominal tidak valid'

    const angka = formatNumber(raw)
    const bgBuf = await fetchBuffer(BG_URL)
    const meta = await sharp(bgBuf).metadata()
    const W = meta.width, H = meta.height

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${CONFIG.rp.x}" y="${CONFIG.rp.y + CONFIG.rp.fontSize}"
        font-family="sans-serif" font-size="${CONFIG.rp.fontSize}" fill="${CONFIG.rp.color}">Rp</text>
      <text x="${CONFIG.saldo.x}" y="${CONFIG.saldo.y + CONFIG.saldo.fontSize}"
        font-family="sans-serif" font-size="${CONFIG.saldo.fontSize}" font-weight="bold" fill="${CONFIG.saldo.color}">${esc(angka)}</text>
    </svg>`

    const result = await sharp(bgBuf)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png()
      .toBuffer()

    await conn.sendMessage(m.chat, { image: result }, { quoted: m })
  } catch (e) {
    throw e
  }
}

handler.help = ['fakedana']
handler.tags = ['maker']
handler.command = /^(fakedana)$/i
handler.limit = true

export default handler
