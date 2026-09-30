import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Khusus grup!')
  
  let q = m.quoted || m
  let mime = q.mimetype || ''

  if (!/image/.test(mime)) return m.reply('Reply gambar untuk dijadikan foto grup!')

  // cek admin
  let groupMetadata = await conn.groupMetadata(m.chat)
  let participants = groupMetadata.participants
  let isAdmin = participants.find(v => v.id === m.sender)?.admin
  let isBotAdmin = participants.find(v => v.id === conn.user.jid)?.admin

  if (!isAdmin) return m.reply('❌ Kamu bukan admin!')
  if (!isBotAdmin) return m.reply('❌ Bot bukan admin!')

  let buffer = await q.download()

  try {
    buffer = await sharp(buffer)
      .resize(640, 640)
      .jpeg({ quality: 80 })
      .toBuffer()

    await conn.updateProfilePicture(m.chat, buffer)
    await m.reply('✅ Foto grup berhasil diubah!')
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengubah foto grup')
  }
}

handler.help = ['setppgrup']
handler.tags = ['group']
handler.command = /^setpp(grup|gc)$/i
handler.group = true
handler.admin = true

export default handler
