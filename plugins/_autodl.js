import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import DownrScraper from '../lib/scrape/downr.js'
import { tiktokScrape } from '../lib/scrape/tikwm.js'

const SUPPORTED = /tiktok\.com|instagram\.com|facebook\.com|fb\.watch|twitter\.com|x\.com|threads\.net/i

let handler = {}

function makeCaption({ author, duration, title }) {
return `
❏ Auto Download

❏ Author      : ${author || '-'}
❏ Duration    : ${duration || '-'}
❏ Title       : ${title || '-'}

❏ Qingxiao Botz
`.trim()
}

handler.before = async (m, { conn }) => {
  const text =
    m.text ||
    m.caption ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ""

  if (!text) return
  if (m.fromMe) return
  if (/^[.#!\/]/.test(text)) return

  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat.autodl) return

  const url = text.match(/https?:\/\/[^\s]+/)?.[0]
  if (!url) return

  if (/youtu\.?be|youtube\.com/i.test(url)) return
  if (!SUPPORTED.test(url)) return

  try {
    await m.react('🕒')

    if (/tiktok\.com/i.test(url)) {
      try {
        let tt = await tiktokScrape(url)

        let caption = makeCaption({
          author: tt.author,
          title: tt.title
        })

        if (tt.type === 'video') {
          await conn.sendMessage(m.chat, {
            video: { url: tt.video },
            caption
          }, { quoted: m })
        } else {
          for (let img of tt.images) {
            await conn.sendMessage(m.chat, {
              image: { url: img },
              caption
            }, { quoted: m })
          }
        }

        return await m.react('✅')
      } catch {}
    }

    try {
      let api = `${global.APIs.faa}/faa/aio?url=${encodeURIComponent(url)}`
      let res = await fetch(api)
      let json = await res.json()

      if (json?.status) {
        let data = json.result

        let caption = makeCaption({
          author: data.author,
          duration: data.duration,
          title: data.title
        })

        await conn.sendMessage(m.chat, {
          video: { url: data.download_url },
          caption
        }, { quoted: m })

        return await m.react('✅')
      }
    } catch {}

    try {
      const scraper = new DownrScraper()
      const result = await scraper.getVideoInfo(url)

      if (result?.medias?.length) {
        let v = result.medias.find(x => x.type === 'video') || result.medias[0]

        let caption = makeCaption({
          author: result.author,
          duration: result.duration,
          title: result.title
        })

        if (v.type === 'video') {
          await conn.sendMessage(m.chat, {
            video: { url: v.url },
            caption
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            image: { url: v.url },
            caption
          }, { quoted: m })
        }

        return await m.react('✅')
      }
    } catch {}

    throw 'fail'

  } catch (e) {
    console.log('AutoDL Error:', e)
    await m.react('❌')
  }
}

export default handler