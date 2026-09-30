import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'

const execPromise = promisify(exec)

let handler = async (m, { conn }) => {
  let api = 'https://www.sankavolereii.my.id/random/nsfw?apikey=planaai'
  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    let res = await fetch(api)
    let contentType = res.headers.get('content-type')

    if (!contentType) throw '❌ Tidak bisa membaca Content-Type.'

    let buffer = await res.buffer()

    // File temp
    let tmpFile = join(tmpdir(), `temp_${Date.now()}`)
    let tmpOutput = join(tmpdir(), `sticker_${Date.now()}.webp`)

    if (contentType.startsWith('image/gif')) {
      // Simpan GIF sementara
      let tmpGif = tmpFile + '.gif'
      writeFileSync(tmpGif, buffer)

      // Convert ke webp animasi via ffmpeg
      await execPromise(`ffmpeg -i ${tmpGif} -vf "scale=512:512:force_original_aspect_ratio=decrease" -loop 0 -preset default -an -vsync 0 -s 512x512 ${tmpOutput}`)

      await conn.sendFile(m.chat, tmpOutput, 'nsfw.webp', '*Random NSFW Sticker Animasi 🔞*', m, false, {
        asSticker: true,
        packname: 'Qingxiao Botz',
        author: 'BY RadzApostle'
      })

      unlinkSync(tmpGif)
      unlinkSync(tmpOutput)

    } else if (contentType.startsWith('image/')) {
      // Simpan image sementara
      let tmpImg = tmpFile + '.png'
      writeFileSync(tmpImg, buffer)

      // Convert ke WebP via sharp
      await sharp(tmpImg)
        .webp({ quality: 70 })
        .toFile(tmpOutput)

      await conn.sendFile(m.chat, tmpOutput, 'nsfw.webp', '*Random NSFW Sticker 🔞*', m, false, {
        asSticker: true,
        packname: 'Bot NSFW',
        author: 'RadzApostle'
      })

      unlinkSync(tmpImg)
      unlinkSync(tmpOutput)

    } else {
      throw `❌ Response tidak dikenali atau bukan image/gif: ${contentType}`
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, e.toString(), m)
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })
  }
}

handler.help = ['nsfwstiker']
handler.tags = ['nsfw']
handler.command = /^nsfwstiker$/i
handler.limit = true
handler.premium = true

export default handler