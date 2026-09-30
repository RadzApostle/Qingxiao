import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return conn.reply(
      m.chat,
      `Masukkan nama kota

Contoh:
${usedPrefix + command} tasikmalaya`,
      m
    )
  }

  let kota = text

  try {
    let res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(kota)}&country=Indonesia&method=11`)
    let json = await res.json()

    if (!json.data) throw 'Not Found'

    let jadwal = json.data.timings
    let tanggal = json.data.date.readable

    let caption = ` *JADWAL SHOLAT*

📍 Kota : ${kota}
📅 Tanggal : ${tanggal}

Subuh : ${jadwal.Fajr}
Dzuhur : ${jadwal.Dhuhr}
Ashar : ${jadwal.Asr}
Maghrib : ${jadwal.Maghrib}
Isya : ${jadwal.Isha}`

    await conn.reply(m.chat, caption, m)

  } catch (e) {
    conn.reply(m.chat, 'Kota tidak ditemukan', m)
  }
}

handler.help = ['jadwalsholat']
handler.tags = ['info']
handler.command = /^jadwalsholat$/i
handler.limit = false

export default handler