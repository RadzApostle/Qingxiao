import axios from 'axios';

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { text, conn, command }) => {
  if (!text) throw `Kirim teks yang ingin diubah jadi suara Nahida!\n\nContoh: .${command} Halo RadzApostle!`

  let res = await fetch(`https://www.sankavolereii.my.id/anime/ttsnahida?apikey=planaai&text=${encodeURIComponent(text)}`);
  if (!res.ok) throw `Gagal ambil audio: ${res.statusText}`

  let buffer = await res.buffer();

  await conn.sendFile(m.chat, buffer, 'nahida.mp3', `✅ Berikut suara Nahida:\n${text}`, m, false, { mimetype: 'audio/mp4' });
}
handler.help = ['ttsnahida <teks>']
handler.tags = ['voice']
handler.command = /^ttsnahida$/i
handler.limit = true

export default handler