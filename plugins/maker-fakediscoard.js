/**
 * Fake Discord Chat — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */

import sharp from 'sharp'
import axios from 'axios'
import moment from 'moment-timezone'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text || !text.includes('|')) {
      return m.reply(`🧙‍♂️ Mantra belum lengkap!\nContoh: ${usedPrefix + command} username|pesan|url_pp`)
    }

    let [username, pesan, ppUrl] = text.split('|').map(v => v.trim())
    if (!username || !pesan) {
      return m.reply(`⚠️ Format salah!\nGunakan: ${usedPrefix + command} username|pesan|url_pp`)
    }

    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss')

    // Load avatar (round clip)
    const AV = 80
    let avBuf
    try {
      const res = await axios.get(ppUrl || 'https://files.catbox.moe/ifx2y7.png', { responseType: 'arraybuffer', timeout: 12000 })
      avBuf = Buffer.from(res.data)
    } catch {
      avBuf = null
    }

    let roundAv = null
    if (avBuf) {
      const mask = Buffer.from(`<svg><circle cx="${AV/2}" cy="${AV/2}" r="${AV/2}" fill="white"/></svg>`)
      roundAv = await sharp(avBuf).resize(AV, AV).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
    }

    const W = 900, H = 200
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Discord dark bg -->
      <rect width="${W}" height="${H}" fill="#2f3136"/>
      <!-- Avatar placeholder circle -->
      ${!roundAv ? `<circle cx="60" cy="60" r="${AV/2}" fill="#72767d"/>` : ''}
      <!-- Username -->
      <text x="120" y="55" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${esc(username)}</text>
      <!-- Time -->
      <text x="${120 + username.length * 13}" y="55" font-family="sans-serif" font-size="12" fill="#72767d">Today at ${esc(waktu)} WIB</text>
      <!-- Message -->
      <text x="120" y="85" font-family="sans-serif" font-size="20" fill="#dcddde">${esc(pesan)}</text>
    </svg>`

    const base = await sharp(Buffer.from(svg)).png().toBuffer()

    let result = base
    if (roundAv) {
      result = await sharp(base).composite([{ input: roundAv, left: 20, top: 20 }]).png().toBuffer()
    }

    await m.reply('⏳ Sedang merakit Discord palsu...')
    await conn.sendFile(m.chat, result, 'fake-discord.png', '✅ Jadi nih fake Discord-nya!', m)
  } catch (e) {
    console.error(e)
    m.reply(String(e))
  }
}

handler.command = ['fdc', 'fakediscoard']
handler.tags = ['maker']
handler.help = ['fdc <username|pesan|url>', 'fakediscoard']
handler.limit = true

export default handler
