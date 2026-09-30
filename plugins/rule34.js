/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

/*
* Kode Dibuat Oleh Radz
* Radz Bukan Dev
* `wa.me/6288294268470`
* `Channel: https://whatsapp.com/channel/0029VaxFZPa0AgW7s0D8nF23`
*/

import axios from 'axios'
import * as cheerio from 'cheerio'
import * as baileys from '@whiskeysockets/baileys'

const { generateWAMessageContent, generateWAMessageFromContent } = baileys
const proto = baileys.default?.proto || baileys.proto

let Radz = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) throw `Masukan query!\n\nContoh:\n${usedPrefix + command} Kafka | 20`

  m.react('⏱️')

  let [query, count] = text.split('|').map(v => v.trim())
  count = Math.min(parseInt(count) || 10, 50)

  const results = await rule34Search(query)
  if (!results.length) return m.reply('Tidak ada hasil ditemukan!')

  const picked = results.sort(() => Math.random() - 0.5).slice(0, count)

  const cards = await Promise.all(
    picked.map(async (item) => {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: item.image } },
        { upload: conn.waUploadToServer }
      )

      return {
        header: proto.Message.InteractiveMessage.Header.create({
          hasMediaAttachment: true,
          imageMessage
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: 'Salin Link',
                copy_code: item.link
              })
            }
          ]
        })
      }
    })
  )

  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
          })
        }
      }
    },
    { quoted: m }
  )

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

Radz.help = ['rule34 <query | jumlah>']
Radz.tags = ['nsfw']
Radz.premium = true
Radz.command = ['rule34']

export default Radz

const headers = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive'
  }
}

async function rule34Search(q) {
  try {
    const { data } = await axios.get(
      `https://rule34.xxx/index.php?page=post&s=list&tags=${encodeURIComponent(q)}`,
      headers
    )

    const $ = cheerio.load(data)
    const results = []

    $('span.thumb').each((_, el) => {
      const aTag = $(el).find('a')
      const imgTag = $(el).find('img')

      const postUrl = `https://rule34.xxx${aTag.attr('href')}`
      const imageUrl = imgTag.attr('src')

      results.push({
        link: postUrl,
        image: imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`
      })
    })

    return results
  } catch (e) {
    console.error('Rule34 error:', e.message)
    return []
  }
}