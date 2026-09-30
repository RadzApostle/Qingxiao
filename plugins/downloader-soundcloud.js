/**
 * SoundCloud Downloader
 * -----------------------------
 * Type    : Plugins ESM
 * creator : RadzApostle
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API     : https://kaizenapi.my.id
 */

import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Masukkan judul lagu atau link SoundCloud!'

  await m.react('🕒')

  try {
    let res = await fetch(
      'https://kaizenapi.my.id/api/downloader/soundcloud?limit=1&query=' +
        encodeURIComponent(text)
    )

    let json = await res.json()

    if (!json.status || json.result.length === 0)
      throw 'Lagu tidak ditemukan.'

    let data = json.result[0]

    let caption = `SOUNDCLOUD DOWNLOADER

Judul: ${data.title}
Artis: ${data.artist}
Plays: ${data.plays}
Durasi: ${data.duration_seconds}s
URL: ${data.url}`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: data.artwork },
        caption
      },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.stream_url },
        mimetype: 'audio/mpeg',
        fileName: `${data.title}.mp3`
      },
      { quoted: m }
    )

  } catch (e) {
    throw 'Yahh error.'
  }
}

handler.help = ['soundcloudplay']
handler.tags = ['downloader']
handler.command = /^(soundcloudplay|soundcloud|scdl)$/i
handler.limit = true

export default handler