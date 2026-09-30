import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

const APIS = [
  { url: 'https://api.waifu.pics/nsfw/waifu', pick: j => j.url },
  { url: 'https://nekos.life/api/v2/img/lewd', pick: j => j.url },
  { url: 'https://nekobot.xyz/api/image?type=lewd', pick: j => j.message },
  { url: 'https://neko-love.xyz/api/v1/lewd', pick: j => j.url },
  { url: 'https://api.waifu.im/search?included_tags=ero', pick: j => j.images?.[0]?.url },
  { url: 'https://nekos.best/api/v2/lewd', pick: j => j.results?.[0]?.url },
  { url: 'https://hmtai.hatsunia.cfd/v2/random', pick: j => j.url }
]

async function tryFetch(api) {
  const res = await fetch(api.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })

  if (!res.ok) throw new Error()

  const json = await res.json()
  const img = api.pick(json)

  if (!img) throw new Error()

  return img
}

let handler = async (m, { conn }) => {
  try {

    let imageUrl = null

    for (const api of APIS) {
      try {
        imageUrl = await tryFetch(api)
        if (imageUrl) break
      } catch {}
    }

    if (!imageUrl) {
      return m.reply('Semua API sedang bermasalah, coba lagi.')
    }

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: '_Nih hehe_',
      footer: 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ',

      nativeFlow: [
        {
          text: 'Next',
          id: '.nsfw3'
        }
      ]

    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan')
  }
}

handler.help = ['nsfw3']
handler.tags = ['nsfw']
handler.command = /^nsfw3$/i
handler.premium = true
handler.group = false
handler.limit = false

export default handler