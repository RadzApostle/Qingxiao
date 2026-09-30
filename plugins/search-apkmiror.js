/**
 * APKMirror Search
 * -----------------------------
 * Type    : Plugins ESM
 * creator : RadzApostle
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API     : https://kaizenapi.my.id
 */

import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { text }) => {
  if (!text) throw 'Masukkan nama aplikasi!'

  await m.react('🕒')

  try {
    let res = await fetch(
      `https://kaizenapi.my.id/api/search/apkmirror?q=${encodeURIComponent(text)}`
    )

    let json = await res.json()

    if (!json.status || !json.result.length)
      throw 'Aplikasi tidak ditemukan.'

    let hasil = json.result.slice(0, 10)

    let caption = `APKMIRROR SEARCH

`

    for (let i = 0; i < hasil.length; i++) {
      let v = hasil[i]

      caption += `${i + 1}. ${v.judul}
❀ Developer : ${v.developer}
❀ Link : ${v.link}

`
    }

    m.reply(caption.trim())
  } catch (e) {
    throw 'Yahh error.'
  }
}

handler.help = ['apkmirror']
handler.tags = ['internet']
handler.command = /^(apkmirror|apksearch)$/i
handler.limit = true

export default handler