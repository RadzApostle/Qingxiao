// Douyin downloader 
// API : https://api-faa.my.id
import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply('Masukkan link Douyin!\n\nContoh:\n.douyin https://v.douyin.com/xxxxx')
  }

  try {
    let url = encodeURIComponent(args[0])
    let api = `https://api-faa.my.id/faa/douyin-down?url=${url}`

    let res = await fetch(api)
    let json = await res.json()

    if (!json.status || !json.result) {
      throw 'Gagal mengambil data Douyin'
    }

    let data = json.result
    let title = data.title || '-'
    let thumbnail = data.thumbnail
    let medias = data.medias || []

    let video = medias.find(v => v.type === 'video')

    if (!video?.url) {
      return m.reply('Video tidak ditemukan')
    }

    let caption = `
✨ *DOUYIN DOWNLOADER*

📌 *Judul:* ${title}
`.trim()

    let thumbBuffer = null
    if (thumbnail) {
      let t = await fetch(thumbnail)
      thumbBuffer = await t.buffer()
    }

    await conn.sendMessage(m.chat, {
      video: { url: video.url },
      caption,
      jpegThumbnail: thumbBuffer
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan saat mengambil video')
  }
}

handler.help = ['douyin <url>']
handler.tags = ['downloader']
handler.command = /^douyin$/i
handler.limit = true

export default handler