/**
 * Sticker ATTP/TTP — Qingxiao Botz
 * Migrated: canvas → sharp + SVG frames + ffmpeg
 */
import sharp from 'sharp'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function create_frame(text, color, pathna) {
  const W = 400, H = 400
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="black"/>
    <text x="${W/2}" y="${H/2}" font-family="sans-serif" font-size="60" font-weight="bold"
      fill="${esc(color)}" text-anchor="middle" dominant-baseline="middle">${esc(text)}</text>
  </svg>`
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  fs.writeFileSync(pathna, buf)
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err)
      else resolve(stdout)
    })
  })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✨ Contoh: ${usedPrefix + command} teks`)
  await m.react('⏳')

  const tmpDir = './tmp'
  const prefix = Date.now()
  const framePaths = []

  try {
    const colors = ['#c8102e', '#d4af37', '#ffffff', '#d4af37', '#c8102e']
    for (let i = 0; i < colors.length; i++) {
      const fp = path.join(tmpDir, `${prefix}_frame${i}.png`)
      await create_frame(text, colors[i], fp)
      framePaths.push(fp)
    }

    const listFile = path.join(tmpDir, `${prefix}_list.txt`)
    const listContent = framePaths.map(f => `file '${path.resolve(f)}'\nduration 0.15`).join('\n')
    fs.writeFileSync(listFile, listContent)

    const gifOut = path.join(tmpDir, `${prefix}_out.gif`)
    await execPromise(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -vf fps=10 "${gifOut}"`)

    await conn.sendMessage(m.chat, { sticker: fs.readFileSync(gifOut) }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Gagal membuat stiker attp: ' + e.message)
  } finally {
    framePaths.forEach(f => { try { fs.unlinkSync(f) } catch {} })
    try { fs.unlinkSync(path.join(tmpDir, `${prefix}_list.txt`)) } catch {}
    try { fs.unlinkSync(path.join(tmpDir, `${prefix}_out.gif`)) } catch {}
  }
}

handler.help = ['attp <teks>', 'ttp <teks>']
handler.tags = ['sticker']
handler.command = /^(attp|ttp)$/i
handler.limit = true

export default handler
