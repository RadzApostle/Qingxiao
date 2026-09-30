import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .epsilon Apa itu chatbot', m)
  }

  let url = `${global.APIs.faa}/faa/epsilon-ai?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result?.length) return

  let hasil = json.result.slice(0, 5).map((v, i) => `
${i + 1}. ${v.title}
Penulis: ${v.authors}
Tahun: ${v.year}
Link: ${v.url}

${v.abstract.slice(0, 300)}...
`.trim()).join('\n\n')

  conn.reply(m.chat, hasil, m)
}

handler.help = ['epsilon']
handler.tags = ['ai']
handler.command = /^epsilon$/i
handler.limit = true

export default handler