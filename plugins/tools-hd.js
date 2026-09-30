import { ImgUpscaler } from '../lib/scrape/upscaler.js'
import axios from 'axios'

let handler = async (m, { conn, args, text }) => {

  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''

  let buffer

  try {
    if (mime.startsWith('image')) {
      buffer = await q.download()

    } else if (text && text.startsWith('http')) {
      let res = await axios.get(text, { responseType: 'arraybuffer' })
      buffer = Buffer.from(res.data)

    } else {
      throw 'Kirim/reply gambar atau URL\n\nContoh:\n.hd 2'
    }

    let scale = args[0] == '4' ? 4 : 2

    await m.reply('✨ wait hd...')

    let result = await ImgUpscaler.process(buffer, scale)

    await conn.sendMessage(m.chat, {
      image: { url: result },
      caption: `✨ HD selesai\nScale: ${scale}x`
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    await m.reply('❌ Error:\n' + e)
  }
}

handler.help = ['hd']
handler.tags = ['tools']
handler.command = /^hd$/i
handler.limit = true

export default handler