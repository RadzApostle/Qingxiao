/**
 * Brat Generator v3 — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */
import sharp from 'sharp'
import { Sticker } from 'wa-sticker-formatter'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function BratGenerator(teks) {
  const SIZE = 512
  const margin = 20
  let fontSize = 80
  let lines = []

  while (fontSize > 24) {
    const approxCW = fontSize * 0.58
    const maxW = SIZE - margin * 2
    const words = teks.split(' ')
    lines = []
    let line = ''
    for (const w of words) {
      if ((line + w + ' ').length * approxCW > maxW && line) {
        lines.push(line.trim())
        line = w + ' '
      } else line += w + ' '
    }
    lines.push(line.trim())
    lines = lines.filter(Boolean)
    const lineH = fontSize * 1.3
    if (lines.length * lineH <= SIZE - margin * 2) break
    fontSize -= 4
  }

  const lineH = Math.round(fontSize * 1.3)
  const totalH = lines.length * lineH
  const startY = Math.round((SIZE - totalH) / 2) + fontSize

  const textEls = lines.map((l, i) =>
    `<text x="${margin}" y="${startY + i * lineH}"
      font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
      font-size="${fontSize}" font-weight="500"
      fill="#000000" filter="url(#blur)">${esc(l)}</text>`
  ).join('\n')

  const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="blur"><feGaussianBlur stdDeviation="1.8"/></filter></defs>
    <rect width="${SIZE}" height="${SIZE}" fill="white"/>
    ${textEls}
  </svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Kirimkan teks!\nContoh: ${usedPrefix + command} halo traveler`
  const img = await BratGenerator(text)
  const sticker = new Sticker(img, {
    pack: 'Qingxiao Botz',
    author: 'RadzApostle',
    quality: 80
  })
  await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m })
}

handler.help = ['brat3', 'brat']
handler.tags = ['sticker']
handler.command = /^(brat3?|brat)$/i
handler.limit = true

export default handler
