import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import similarity from 'similarity'

let timeout = 120000
let poin = 500
const threshold = 0.72

let handler = async (m, { conn }) => {
  conn.tebakanime = conn.tebakanime ? conn.tebakanime : {}

  let id = m.chat
  if (id in conn.tebakanime)
    return conn.reply(m.chat, '❗Masih Ada Soal Yang Belum Terjawab', conn.tebakanime[id][0])

  let src = await (await fetch('https://raw.githubusercontent.com/unx21/ngetezz/main/src/data/nyenyenye.json')).json()
  let json = src[Math.floor(Math.random() * src.length)]

  let caption = `
🖼️ *TEBAK ANIME*

⏱️ Timeout ${timeout / 1000} detik
💎 Bonus ${poin} XP

Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await conn.sendMessage(
    m.chat,
    { image: { url: json.img }, caption },
    { quoted: m }
  )

  conn.tebakanime[id] = [
    msg,
    { jawaban: (json.jawaban || '').toLowerCase().trim() },
    poin,
    setTimeout(() => {
      if (conn.tebakanime[id]) {
        conn.reply(m.chat, `⏰ Waktu habis!\nJawaban: *${json.jawaban}*`, msg)
        const _ref = conn.tebakanime; delete _ref[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakanime']
handler.tags = ['game']
handler.command = /^tebakanime$/i
handler.group = true
handler.limit = false

export default handler


handler.before = async function (m, { conn }) {
  conn.tebakanime = conn.tebakanime ? conn.tebakanime : {}

  let id = m.chat
  if (!(id in conn.tebakanime)) return

  let [msg, data, xp, time] = conn.tebakanime[id]
  if (!m.text) return

  let teks = m.text.toLowerCase().replace(/\s+/g,' ').trim()
  let jawaban = data.jawaban

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    const _ref = conn.tebakanime; delete _ref[id]
    m.reply(`🏳️ *Menyerah!*\nJawaban: *${jawaban}*`)
    return true
  }

  if (teks === jawaban) {
    clearTimeout(time)
    const _ref = conn.tebakanime; delete _ref[id]
    if (global.db.data.users[m.sender]) global.db.data.users[m.sender].exp += xp
    m.reply(`🎉 *Benar!*\n+${xp} XP`)
    return true
  }

  if (similarity(teks, jawaban) >= threshold) {
    m.reply('🤏 Dikit lagi!')
    return true
  }

  return true
}