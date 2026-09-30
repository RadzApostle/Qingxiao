/* * Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import axios from 'axios'
import * as cheerio from 'cheerio'
import pkg from '@whiskeysockets/baileys'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = pkg

async function sendButtonSlide(conn, jid, buttons = [], quoted, options = {}) {
  async function createImage(url) {
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`
    const { imageMessage } = await generateWAMessageContent(
      { image: { url: proxyUrl } },
      { upload: conn.waUploadToServer }
    )
    return imageMessage
  }

  let push = []
  for (let btn of buttons) {
    let header = await createImage(btn.url)
    let buttonActions = []
    if (btn.web) {
      buttonActions = buttonActions.concat(
        btn.web.map(item => ({
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: item.text,
            url: item.url,
            merchant_url: item.url
          })
        }))
      )
    }
    push.push({
      body: proto.Message.InteractiveMessage.Body.create({ text: btn.text }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: btn.footer }),
      header: proto.Message.InteractiveMessage.Header.create({
        title: btn.header,
        hasMediaAttachment: true,
        imageMessage: header
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: buttonActions
      })
    })
  }

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ text: options.text }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: options.footer }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards: push })
        })
      }
    }
  }, { quoted, userJid: jid })

  await conn.relayMessage(jid, msg.message, { messageId: msg.key.id })
}

let Radz = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Usage: ${usedPrefix + command} <url/id>\nExample: ${usedPrefix + command} 4946`)

  const postId = text.match(/\d+/) ? text.match(/\d+/)[0] : null
  if (!postId) return m.reply("Invalid URL or Post ID")
  
  const baseUrl = "https://kiutaku.com"
  const targetUrl = `${baseUrl}/${postId}`

  m.reply('Processing...')

  try {
    const { data } = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3' }
    })
    const $ = cheerio.load(data)
    
    const title = $('h1.article-title').text().trim() || 'Kiutaku Post'
    
    let pages = [targetUrl]
    $('.pagination-link').each((i, el) => {
      let href = $(el).attr('href')
      let fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`
      if (!pages.includes(fullUrl)) pages.push(fullUrl)
    })

    let allImages = []
    for (let pageUrl of pages) {
      const pageRes = await axios.get(pageUrl)
      const $page = cheerio.load(pageRes.data)
      $page('.article-fulltext img').each((i, el) => {
        let src = $page(el).attr('src')
        if (src) allImages.push(src)
      })
    }

    if (allImages.length === 0) return m.reply("No images found.")

    const slides = allImages.map((img, i) => ({
      header: `Image ${i + 1}/${allImages.length}`,
      text: `Title: ${title}`,
      footer: `Source: Kiutaku`,
      url: img,
      web: [{ text: 'View Source', url: targetUrl }]
    }))

    await sendButtonSlide(conn, m.chat, slides, m, {
      text: `*Kiutaku Downloader*\n\n• *Title:* ${title}\n• *Total:* ${allImages.length} Images`,
      footer: `Kiutaku Scraper`
    })

  } catch (e) {
    console.error(e)
    m.reply("System Error")
  }
}

Radz.help = ['kiutaku']
Radz.tags = ['premium', 'downloader']
Radz.command = /^(kiutaku|kiu)$/i
Radz.premium = true

export default Radz