import sharp from 'sharp'

let handler = async (m, { conn }) => {
  let q = m.quoted || m
  let mime = q.mimetype || ''

  if (!mime.startsWith('image/')) return m.reply('Reply gambar!')

  let buffer = await q.download()

  let output = await sharp(buffer)
    .resize(512)
    .png()
    .toBuffer()

  await conn.sendMessage(m.chat, { image: output }, { quoted: m })
}

handler.command = ['resize']
export default handler
