/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import axios from 'axios'
import * as cheerio from 'cheerio'

let Radz = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Example: ${usedPrefix + command} https://www.erome.com/a/sLgmiGUf`)

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.erome.com/'
        }

        const response = await axios.get(text, { headers })
        const $ = cheerio.load(response.data)

        let album_title = $('meta[property="og:title"]').attr('content') || 'Erome Video'
        album_title = album_title.replace(/[\\/:*?"<>|]/g, '_').trim()

        const videos = []
        $('source').each((i, el) => {
            const src = $(el).attr('src')
            if (src) videos.push(src)
        })

        if (videos.length === 0) {
            return m.reply('Tidak ada video ditemukan di URL tersebut')
        }

        const videoUrl = videos[0]
        
        const videoResponse = await axios.get(videoUrl, {
            headers: {
                ...headers,
                'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Range': 'bytes=0-'
            },
            responseType: 'arraybuffer'
        })

        await conn.sendMessage(m.chat, { 
            video: videoResponse.data, 
            caption: album_title,
            mimetype: 'video/mp4'
        }, { quoted: m })

    } catch (error) {
        m.reply(`❌ Error: ${error.message}`)
    }
}

Radz.help = ['erome <url>']
Radz.tags = ['nsfw']
Radz.command = ['erome']
Radz.premium = true

export default Radz
