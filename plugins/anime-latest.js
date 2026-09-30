import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://api.sansekai.my.id/api/anime/latest')
    const data = await res.json()

    if (!data.length) throw 'Anime tidak ditemukan.'

    let teks = `🎌 *ANIME TERBARU*\n\n`

    data.forEach((anime, i) => {
      teks += `*${i + 1}. ${anime.judul}*\n`
      teks += `📺 Episode : ${anime.lastch}\n`
      teks += `🕒 Update  : ${anime.lastup}\n`
      teks += `🔗 Link    : https://sansekai.my.id/anime/${anime.url}\n\n`
    })

    await conn.sendFile(
      m.chat,
      data[0].cover,
      'anime.jpg',
      teks,
      m
    )

  } catch (e) {
    m.reply('❌ Gagal mengambil data anime terbaru')
  }
}

handler.help = ['animelatest']
handler.tags = ['anime']
handler.command = /^(animelatest|latestanime)$/i
handler.limit = true

export default handler