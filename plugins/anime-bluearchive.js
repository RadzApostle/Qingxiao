import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, command }) => {
  try {
    const res = await fetch('https://api.siputzx.my.id/api/r/blue-archive')
    const buffer = await res.buffer()

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `Waifu Random Blue Archive\n\nKlik tombol di bawah untuk waifu baru`,
      footer: 'Qingxiao Botz MD',

      nativeFlow: [
        {
          text: 'Next Waifu',
          id: `.${command}`
        }
      ]

    }, { quoted: m })
    
  } catch (err) {
    console.error(err)
    m.reply('Gagal memuat waifu')
  }
}

handler.help = ['bluearchive']
handler.tags = ['anime', 'random']
handler.command = /^bluearchive$/i
handler.limit = true

export default handler