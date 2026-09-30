/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import axios from 'axios'
import * as cheerio from 'cheerio'

let Radz = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Example: ${usedPrefix + command} https://rule34video.com/video/3430588/original-characters-group-sex-pack-animation/`)

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://rule34video.com/'
        }

        const initResponse = await axios.get(text, { headers })
        const cookieHeader = initResponse.headers['set-cookie']
        let phpSessId = ''
        
        if (cookieHeader) {
            const match = cookieHeader.join(';').match(/PHPSESSID=([^;]+)/)
            if (match) phpSessId = match[1]
        }

        const $ = cheerio.load(initResponse.data)

        let title = $('h1').text().trim()
        let artist = ''

        $('.cols .col').each((i, el) => {
            const label = $(el).find('.label').text().trim()
            if (label === 'Artist') {
                const names = []
                $(el).find('span').each((idx, span) => {
                    names.push($(span).text().trim())
                })
                if (names.length > 0) artist = names.join('-')
            } else if (label === 'Uploaded by' && !artist) {
                artist = $(el).find('a').text().trim()
            }
        })

        if (!artist || artist === 'Unknown Artist') artist = 'Unknown'

        let cleanTitle = `${artist}) ${title}`.replace(/[\\/:*?"<>|]/g, '_').trim()

        let rawVideoUrl = ''
        $('.video_tools .wrap').last().find('a').each((i, el) => {
            const href = $(el).attr('href')
            if (href) rawVideoUrl = href
        })

        if (!rawVideoUrl) {
            return m.reply('Tidak dapat menemukan link download video')
        }

        let finalVideoUrl = rawVideoUrl
        try {
            const headHeaders = { ...headers }
            if (phpSessId) headHeaders['Cookie'] = `PHPSESSID=${phpSessId}`

            const headResponse = await axios.head(rawVideoUrl, { 
                headers: headHeaders,
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400
            })

            if (headResponse.status === 302 && headResponse.headers['location']) {
                finalVideoUrl = headResponse.headers['location']
            }
        } catch (e) {
            if (e.response && e.response.status === 302 && e.response.headers['location']) {
                finalVideoUrl = e.response.headers['location']
            }
        }

        const videoResponse = await axios.get(finalVideoUrl, {
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
            caption: cleanTitle,
            mimetype: 'video/mp4'
        }, { quoted: m })

    } catch (error) {
        m.reply(`❌ Error: ${error.message}`)
    }
}

Radz.help = ['r34video <url>']
Radz.tags = ['nsfw']
Radz.command = ['r34video', 'rule34video']
Radz.premium = true

export default Radz
