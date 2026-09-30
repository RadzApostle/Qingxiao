import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text, command }) => {
  let apikey = 'planaai'
  if (!text) throw `Kirim teks yang mau diucapkan Miku!\n\nContoh: .${command} Haloo RadzApostle`
  
  await m.react('🎶')
  
  try {
    let res = await fetch(`https://www.sankavolereii.my.id/anime/ttsmiku?apikey=${apikey}&text=${encodeURIComponent(text)}`)
    if (!res.ok) throw await res.text()

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'miku.mp3', `🎶 Miku sudah ngomong: ${text}`, m)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.reply('❌ Gagal mengambil audio dari API.')
    await m.react('❌')
  }
}

handler.help = ['mikutalk <teks>']
handler.tags = ['tools', 'sound']
handler.command = /^mikutalk$/i
handler.limit = true

export default handler