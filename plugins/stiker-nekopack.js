/* 
Fitur : Stiker nekopack
type : plugins esm
sumber : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K

*/

import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, command }) => {
  
  let available = [
    'smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap',
    'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug',
    'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif'
  ]

  if (!available.includes(command)) return m.reply('Kategori tidak tersedia.')

  let res = await fetch(`https://nekos.life/api/v2/img/${command}`)
  if (!res.ok) throw 'Gagal ambil gambar.'
  let data = await res.json()
  let url = data.url

  let stiker = new Sticker(url, {
    pack: 'Qingxiao Botz',
    author: 'RadzApostle',
    type: 'full',
    categories: ['Anime'],
    id: command,
    quality: 70
  })

  let buffer = await stiker.toBuffer()
  await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.command = /^(smug|woof|gasm|8ball|goose|cuddle|avatar|slap|v3|pat|gecg|feed|fox_girl|lizard|neko|hug|meow|kiss|wallpaper|tickle|spank|waifu|lewd|ngif)$/i
handler.tags = ['random']
handler.help = ['smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap', 'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug', 'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif']

export default handler