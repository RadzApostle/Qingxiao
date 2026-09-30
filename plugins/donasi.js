let handler = async (m, { conn }) => {
  let text = `
 *SUPPORT BOT Qingxiao Botz* 🤍

Jika bot ini bermanfaat untukmu,
kamu bisa memberikan dukungan lewat donasi ✨

`

  await conn.sendMessage(m.chat, {
  image: { url: './media/qris.jpg' },
  caption: text
}, { quoted: m })
}
handler.help = ['donasi']
handler.tags = ['info']
handler.command = /^donasi$/i

export default handler