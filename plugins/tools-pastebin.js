import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  if (!text) throw `⚠️ Masukkan link Pastebin!\n\nContoh:\n.pastebin https://pastebin.com/kwLd6w7N`

  try {
    let url = `https://api.princetechn.com/api/download/pastebin?apikey=prince&url=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let data = await res.json()

    if (!data.success) throw `❌ Gagal mengambil data dari Pastebin.`

    let hasil = data.result || 'Tidak ada hasil.'
    await conn.reply(m.chat, hasil, m)
  } catch (e) {
    console.error(e)
    throw `❌ Error mengambil data Pastebin!`
  }
}

handler.help = ['pastebin <url>']
handler.tags = ['tools']
handler.command = /^pastebin$/i
handler.limit = true

export default handler