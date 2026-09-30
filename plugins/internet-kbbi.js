import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .kbbi Anu', m)
  }

  let url = `${global.APIs.faa}/faa/kbbi?q=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result) return

  let hasil = `
${json.result.kata}

${json.result.keterangan}
`.trim()

  conn.reply(m.chat, hasil, m)
}

handler.help = ['kbbi']
handler.tags = ['internet']
handler.command = /^kbbi$/i
handler.limit = true

export default handler