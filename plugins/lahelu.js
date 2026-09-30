import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.siputzx.my.id/api/r/lahelu')
    if (!res.ok) throw 'Gagal mengambil data'
    
    let json = await res.json()
    if (!json.status || !json.data || !json.data.length) throw 'Data kosong'

    // Pilih random post
    let post = json.data[Math.floor(Math.random() * json.data.length)]
    let media = post.media
    let mediaType = post.mediaType // 0: image, 1: video
    let title = post.title
    let author = post.userInfo?.username || 'unknown'
    let upvote = post.totalUpvotes || 0
    let link = post.postID || 'https://lahelu.com'

    let caption = `📮 *${title}*\n👤 @${author}\n👍 ${upvote} upvotes\n🔗 ${link}`

    if (mediaType === 1) {
      await conn.sendFile(m.chat, media, 'video.mp4', caption, m)
    } else if (mediaType === 0) {
      await conn.sendFile(m.chat, media, 'image.jpg', caption, m)
    } else {
      throw 'Format media tidak didukung.'
    }
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal mengambil konten dari Lahelu.\n${e}`)
  }
}

handler.help = ['lahelu']
handler.tags = ['random']
handler.command = /^lahelu$/i
handler.limit = true

export default handler