import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Example: ${usedPrefix + command} 1+1`)
  }

  await conn.sendMessage(m.chat, {
    react: { text: '🕒', key: m.key }
  })

  try {
    let url = API('lol', '/api/roboguru', {
      query: text,
      grade: 'sma',
      subject: 'sejarah'
    })

    let res = await fetch(url)
    let json = await res.json()

    if (json.status !== 200 || !json.result?.length) {
      return m.reply('Tidak ditemukan jawaban untuk pertanyaan itu')
    }

    let q = json.result[0].question
    let a = json.result[0].answer

    let msg = `📘 *RoboGuru*\n\n*Pertanyaan:*\n${q}\n\n*Jawaban:*\n${a}`

    m.reply(msg)

  } catch (e) {
    m.reply('Terjadi kesalahan saat mengambil data dari Lolhuman')
  }
}

handler.help = ['roboguru <pertanyaan>']
handler.tags = ['internet']
handler.command = /^roboguru$/i
handler.limit = true

export default handler