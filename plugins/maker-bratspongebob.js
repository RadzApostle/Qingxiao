/**
 * SpongeBob Brat Meme — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */
import sharp from 'sharp'
import axios from 'axios'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function mockingText(text) {
  return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('')
}

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukkan teks!\n\nContoh:\n${usedPrefix + command} halo traveler`)

  try {
    const imageUrl = 'https://img1.pixhost.to/images/11791/687260942_vynaa-valerie.jpg'
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
    const imgBuf = Buffer.from(res.data)
    const meta = await sharp(imgBuf).metadata()
    const W = meta.width, H = meta.height

    const mockedText = mockingText(text)
    const fontSize = 32
    const textY = H - 40

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${W/2}" y="${textY}"
        font-family="Impact, sans-serif" font-size="${fontSize}"
        fill="white" stroke="black" stroke-width="3"
        text-anchor="middle">${esc(mockedText)}</text>
    </svg>`

    const result = await sharp(imgBuf)
      .composite([{ input: Buffer.from(svg) }])
      .jpeg({ quality: 90 })
      .toBuffer()

    await conn.sendFile(m.chat, result, 'bratspongebob.jpg', '🧽 SpongeBob Brat by Qingxiao Botz', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal: ' + e.message)
  }
}

handler.help = ['bratspongebob', 'spongebob']
handler.tags = ['maker']
handler.command = /^(bratspongebob|spongebob)$/i
handler.limit = true

export default handler
