/* 
Sertifikat Tolol
Plugin ESM 
API : https://api.siputzx.my.id
*/
import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('⚠️ Masukkan nama untuk sertifikatnya!\n\nContoh:\n.sertiftolol RadzApostle')

  try {
    let url = `https://api.siputzx.my.id/api/m/sertifikat-tolol?text=${encodeURIComponent(text)}`
    let res = await fetch(url)
    if (!res.ok) throw 'Gagal mengunduh gambar.'

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'sertif.jpg', `🏅 Sertifikat untuk: *${text}*`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat sertifikat. Coba lagi nanti.')
  }
}

handler.help = ['sertiftolol']
handler.tags = ['maker']
handler.command = /^sertiftolol|sertifikattolol$/i
handler.limit = true

export default handler