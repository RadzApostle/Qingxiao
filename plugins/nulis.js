/**
 * Nulis (Tulis di Kertas) — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */

import sharp from 'sharp'
import fs from 'fs'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function wrapText(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    if ((line + word).length > maxChars) {
      lines.push(line.trim())
      line = word + ' '
    } else {
      line += word + ' '
    }
  }
  if (line) lines.push(line.trim())
  return lines
}

let handler = async (m, { conn, args }) => {
  try {
    const bgPath = 'src/kertas/magernulis1.jpg'
    if (!fs.existsSync(bgPath)) return m.reply('❌ Background kertas tidak ditemukan!')

    const bgBuf = fs.readFileSync(bgPath)
    const meta = await sharp(bgBuf).metadata()
    const W = meta.width, H = meta.height

    const teks = args.join(' ')
    const wrapped = wrapText(teks, 43)

    const d = new Date()
    const tgl = d.toLocaleDateString('id-ID')
    const hari = d.toLocaleDateString('id-ID', { weekday: 'long' })

    const lineH = 24
    const startX = 344, startY = 142

    const textLines = wrapped.map((line, i) =>
      `<text x="${startX}" y="${startY + i * lineH}"
        font-family="cursive, sans-serif" font-size="20" fill="black">${esc(line)}</text>`
    ).join('\n')

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="806" y="78" font-family="cursive, sans-serif" font-size="20" fill="black">${esc(hari)}</text>
      <text x="806" y="102" font-family="cursive, sans-serif" font-size="18" fill="black">${esc(tgl)}</text>
      ${textLines}
    </svg>`

    const result = await sharp(bgBuf)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer()

    await conn.sendFile(m.chat, result, 'nulis.jpg', '*Hati² ketahuan:v*', m)
  } catch (e) {
    m.reply('❌ Terjadi kesalahan!\n\n' + e.message)
  }
}

handler.help = ['nulis']
handler.tags = ['maker']
handler.command = /^(nulis)$/i
handler.register = true

export default handler
