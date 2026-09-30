/**
 * Maker Brat Elaina — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */

import sharp from 'sharp'
import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function wrapText(text, maxWidth, approxCharWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line + w + ' '
    if (test.length * approxCharWidth > maxWidth && line !== '') {
      lines.push(line.trim())
      line = w + ' '
    } else {
      line = test
    }
  }
  lines.push(line.trim())
  return lines.filter(Boolean)
}

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { text: `✨ Contoh:\n${usedPrefix + command} halo traveler` }, { quoted: global.fkontak })
  }

  await m.react('✨')

  try {
    const imageUrl = 'https://i.ibb.co/tPwDK5BC/image.jpg'
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
    const imgBuf = Buffer.from(res.data)

    const meta = await sharp(imgBuf).metadata()
    const W = meta.width, H = meta.height

    // Estimate board area proportionally
    const boardX = Math.round(W * 0.16)
    const boardY = Math.round(H * 0.66)
    const boardW = Math.round(W * 0.68)
    const boardH = Math.round(H * 0.26)

    // Auto font size
    let fontSize = 72
    let lines = []
    while (fontSize > 28) {
      const approxCW = fontSize * 0.55
      lines = wrapText(text, boardW * 0.84, approxCW)
      const lineH = fontSize * 1.1
      if (lines.length <= 3 && lines.length * lineH <= boardH) break
      fontSize -= 2
    }

    const lineH = Math.round(fontSize * 1.1)
    const totalH = lines.length * lineH
    const startY = boardY + Math.round((boardH - totalH) / 2) + fontSize

    const textElements = lines.slice(0, 3).map((l, i) =>
      `<text x="${boardX + boardW / 2}" y="${startY + i * lineH}"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${fontSize}" font-weight="500"
        fill="#000000" text-anchor="middle">${esc(l)}</text>`
    ).join('\n')

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${textElements}
    </svg>`

    const resultBuf = await sharp(imgBuf)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png()
      .toBuffer()

    const stickerBuffer = await createSticker(resultBuf, {
      type: StickerTypes.FULL,
      pack: 'Qingxiao Botz',
      author: 'RadzApostle',
      quality: 80
    })

    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: global.fkontak })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { text: '❌ Gagal membuat stiker' }, { quoted: global.fkontak })
  }
}

handler.help = ['bratelaina']
handler.tags = ['maker']
handler.command = /^bratelaina$/i
handler.limit = true
handler.register = true

export default handler
