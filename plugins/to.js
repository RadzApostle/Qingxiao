/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import { exec } from 'child_process'
import fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'

const execPromise = promisify(exec)

let Radz = async (m, { conn, usedPrefix, command, args }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let type = (args[0] || '').toLowerCase()

    if (!['vn', 'audio', 'video', 'img', 'gif'].includes(type)) {
        let menu = `*─── « CONVERTER TOOLS » ───*\n\nHai *@${m.sender.split('@')[0]}*, pilih format:\n\n┌  ◦  *${usedPrefix + command} vn* (Video/Audio ➜ VN)\n├  ◦  *${usedPrefix + command} audio* (Video ➜ MP3)\n├  ◦  *${usedPrefix + command} video* (Audio/Img ➜ Video)\n├  ◦  *${usedPrefix + command} img* (Sticker ➜ Image)\n└  ◦  *${usedPrefix + command} gif* (Video ➜ GIF)\n\n_Reply media lalu ketik perintah._`
        return conn.sendMessage(m.chat, { text: menu, mentions: [m.sender] }, { quoted: m })
    }

    if (type === 'img' && !/webp/.test(mime)) return m.reply('⚠️ Reply *sticker*!')
    if (type === 'gif' && !/video/.test(mime)) return m.reply('⚠️ Reply *video*!')
    if ((type === 'vn' || type === 'audio') && !/audio|video/.test(mime)) return m.reply(`⚠️ Balas audio atau video dengan perintah ${usedPrefix + command} ${type}`)
    if (type === 'video' && !/audio|image|webp/.test(mime)) return m.reply('⚠️ Reply *audio/image/sticker*!')

    m.reply('_Processing..._ ⏳')

    let inputPath = ''
    let outPath = ''

    try {
        let mediaBuffer = await q.download()
        if (!mediaBuffer) throw 'Gagal mengunduh media dari pesan.'

        const tmpDir = join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

        let name = Date.now()
        let ext = mime.split('/')[1] || 'tmp'
        if (ext.includes(';')) ext = ext.split(';')[0]

        if (ext === 'tmp') {
            if (/video/.test(mime)) ext = 'mp4'
            else if (/audio/.test(mime)) ext = 'mp3'
            else if (/webp/.test(mime)) ext = 'webp'
            else if (/image/.test(mime)) ext = 'jpg'
        }

        inputPath = join(tmpDir, `${name}_in.${ext}`)
        fs.writeFileSync(inputPath, mediaBuffer)

        outPath = join(tmpDir, `${name}_out`)
        let ffmpegCmd = ''

        switch (type) {
            case 'vn':
                outPath += '.opus'
                ffmpegCmd = `ffmpeg -i "${inputPath}" -c:a libopus -b:a 128k -vbr on -compression_level 10 "${outPath}" -y`
                break
            case 'audio':
                outPath += '.mp3'
                ffmpegCmd = `ffmpeg -y -i "${inputPath}" -vn -b:a 192k "${outPath}"`
                break
            case 'img':
                outPath += '.jpg'
                ffmpegCmd = `ffmpeg -y -i "${inputPath}" "${outPath}"`
                break
            case 'video':
                outPath += '.mp4'
                if (/webp|image/.test(mime)) {
                    ffmpegCmd = `ffmpeg -y -loop 1 -i "${inputPath}" -c:v libx264 -t 5 -pix_fmt yuv420p "${outPath}"`
                } else if (/audio/.test(mime)) {
                    ffmpegCmd = `ffmpeg -y -f lavfi -i color=c=black:s=1280x720:r=30 -i "${inputPath}" -c:v libx264 -c:a aac -shortest -pix_fmt yuv420p "${outPath}"`
                } else {
                    ffmpegCmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -c:a aac -pix_fmt yuv420p "${outPath}"`
                }
                break
            case 'gif':
                outPath += '.mp4'
                ffmpegCmd = `ffmpeg -y -i "${inputPath}" -vf fps=15 -an -c:v libx264 -pix_fmt yuv420p "${outPath}"`
                break
        }

        await execPromise(ffmpegCmd)

        if (!fs.existsSync(outPath)) throw 'Gagal saat memproses konversi.'
        let buffer = fs.readFileSync(outPath)

        if (type === 'vn') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
        } else if (type === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m })
        } else if (type === 'img') {
            await conn.sendMessage(m.chat, { image: buffer, caption: '✅ Sticker ➜ Image' }, { quoted: m })
        } else if (type === 'video') {
            await conn.sendMessage(m.chat, { video: buffer, caption: '✅ Konversi ke Video selesai' }, { quoted: m })
        } else if (type === 'gif') {
            await conn.sendMessage(m.chat, { video: buffer, gifPlayback: true, caption: '✅ Video ➜ GIF' }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: ${e.message || e}`)
    } finally {
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (outPath && fs.existsSync(outPath)) fs.unlinkSync(outPath)
    }
}

Radz.help = ['to <vn|audio|video|img|gif>']
Radz.tags = ['tools']
Radz.command = /^(to)$/i
Radz.limit = true

export default Radz