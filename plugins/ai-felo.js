import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .felo Apa itu bot wa', m)
  }

  let url = `${global.APIs.faa}/faa/feloai?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  let sumber = (json.sources || [])
    .slice(0, 5)
    .map((v, i) => `${i + 1}. ${v.title}\n${v.url}`)
    .join('\n\n')

  let hasil = `${json.result.trim()}\n\nSumber:\n${sumber}`

  conn.reply(m.chat, hasil, m)
}

handler.help = ['felo']
handler.tags = ['ai']
handler.command = /^felo$/i
handler.limit = true

export default handler