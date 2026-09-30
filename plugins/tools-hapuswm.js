import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import { uploadFile } from '../lib/uploadImage.js'

let handler = async (m, { conn }) => {
  await m.react('✨')

  let q = m.quoted
  if (!q) {
    await conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.hapuswm*' },
      { quoted: global.fkontak }
    )
    return
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    await conn.sendMessage(
      m.chat,
      { text: 'ℹ️ Cara pakai:\nReply gambar lalu ketik *.hapuswm*' },
      { quoted: global.fkontak }
    )
    return
  }

  let buffer = await q.download().catch(() => null)
  if (!buffer) return

  try {
    let srcUrl = await uploadFile(buffer)

    let apiUrl = `https://api.snowping.my.id/api/tools/removewm?url=${encodeURIComponent(srcUrl)}`
    let apiRes = await fetch(apiUrl)
    if (!apiRes.ok) throw 'API error'

    let apiJson = await apiRes.json()
    let resultUrl = apiJson?.result?.output?.[0]
    if (!resultUrl) throw 'Result kosong'

    let imgRes = await fetch(resultUrl)
    if (!imgRes.ok) throw 'Fetch image error'

    let imgBuffer = await imgRes.buffer()

    await conn.sendMessage(
      m.chat,
      {
        image: imgBuffer,
        caption: '✨ Remove Watermark'
      },
      {
        quoted: global.fkontak
      }
    )
  } catch {
    await conn.sendMessage(
      m.chat,
      { text: '❌ Gagal menghapus watermark' },
      { quoted: global.fkontak }
    )
  }
}

handler.help = ['hapuswm']
handler.tags = ['tools']
handler.command = /^hapuswm$/i
handler.limit = true

export default handler