import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} https://vt.tiktok.com/xxxx`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/aio?url=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil data.'

    let data = json.result
    let videoUrl = data.download_url

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: data.title || 'Video berhasil diunduh'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil video.', m)
  }
}

handler.help = ['aio2 <url>']
handler.tags = ['downloader']
handler.command = /^aio2$/i
handler.limit = true

export default handler