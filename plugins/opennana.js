import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  if (!text) {
    throw `🖤 Masukkan kata kunci

Contoh:
.opennana anime
.opennana cyberpunk
.opennana logo`
  }

  let search = await fetch(
    `https://api.opennana.com/api/prompts?search=${encodeURIComponent(text)}`
  )

  let s = await search.json()

  if (!s?.data?.items?.length) {
    throw '❀ Prompt tidak ditemukan'
  }

  let item = s.data.items[
    Math.floor(Math.random() * s.data.items.length)
  ]

  let detail = await fetch(
    `https://api.opennana.com/api/prompts/${item.slug}`
  )

  let d = await detail.json()

  if (!d?.data) throw '❀ Gagal mengambil detail prompt'

  let data = d.data

  let prompt = data.prompts?.[0]?.text || 'Tidak ada prompt'

  let caption = `╭━━〔 OPENNANA SEARCH 〕━⬣
❀ Query : ${text}
❀ Judul : ${data.title}
❀ Model : ${data.model || '-'}
❀ Tags : ${data.tags?.join(', ') || '-'}
❀ Source : ${data.source_name || '-'}
╰━━━━━━━━━━━━⬣

📝 Prompt:

${prompt.length > 3500 ? prompt.slice(0, 3500) + '...' : prompt}`

  await conn.sendFile(
    m.chat,
    data.images?.[0] || item.cover_image,
    'opennana.jpg',
    caption,
    m
  )
}

handler.help = ['opennana <query>']
handler.tags = ['ai']
handler.command = /^opennana$/i
handler.limit = true

export default handler