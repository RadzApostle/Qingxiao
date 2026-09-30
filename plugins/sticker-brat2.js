/**
 * Brat Canvas Sticker — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */
import sharp from 'sharp'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function wrapBratText(text, fontSize, size) {
  const approxCW = fontSize * 0.58
  const maxW = size - 40
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line + w + ' '
    if (test.length * approxCW > maxW && line !== '') {
      lines.push(line.trim())
      line = w + ' '
    } else line = test
  }
  lines.push(line.trim())
  return lines.filter(Boolean)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Kirimkan teks.\nContoh: ${usedPrefix + command} ini teks`

  const SIZE = 512
  let fontSize = 80
  let lines = []

  while (fontSize > 24) {
    lines = wrapBratText(text, fontSize, SIZE)
    const lineH = fontSize * 1.1
    if (lines.length * lineH <= SIZE - 60) break
    fontSize -= 4
  }

  const lineH = Math.round(fontSize * 1.1)
  const totalH = lines.length * lineH
  const startY = Math.round((SIZE - totalH) / 2) + fontSize

  const textEls = lines.map((l, i) =>
    `<text x="${SIZE / 2}" y="${startY + i * lineH}"
      font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
      font-size="${fontSize}" font-weight="bold"
      fill="#000000" text-anchor="middle"
      filter="url(#blur)">${esc(l)}</text>`
  ).join('\n')

  const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="blur"><feGaussianBlur stdDeviation="1.5"/></filter>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" fill="#FFFFFF"/>
    ${textEls}
  </svg>`

  const imgBuf = await sharp(Buffer.from(svg)).png().toBuffer()

  const sticker = new Sticker(imgBuf, {
    type: StickerTypes.FULL,
    pack: 'Qingxiao Botz',
    author: 'RadzApostle',
    quality: 80
  })

  await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m })
}

handler.help = ['brat2']
handler.tags = ['sticker']
handler.command = /^(brat2)$/i
handler.limit = true

export default handler
