import { Sticker } from 'wa-sticker-formatter'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {

    if (m.quoted && m.quoted.text) {
        text = m.quoted.text || 'hai'
    } else if (text) {
        text = text
    } else if (!text && !m.quoted) {
        return conn.reply(
            m.chat,
            'Reply atau masukan teks\n\nContoh:\n.brat halo kaaoffc',
            global.fakes
        )
    }

    try {

        await m.react('🕒')

        const response = `https://aqul-brat.hf.space?text=${encodeURIComponent(text)}`

        let stiker = await createSticker(
            false,
            response,
            global.stickpack || global.namebot || 'Sticker Pack',
            global.stickauth || global.author || 'Bot',
            10
        )

        if (stiker) {

            await sendAiSticker(conn, m, stiker)

            await m.react('✅')

        } else {

            conn.reply(
                m.chat,
                'Gagal membuat stiker.',
                global.fakes
            )

            await m.react('❌')

        }

    } catch (e) {

        console.log(e)

        conn.reply(
            m.chat,
            'Terjadi kesalahan saat membuat stiker.',
            global.fakes
        )

        await m.react('❌')

    }

}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat)$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler

async function createSticker(img, url, packName, authorName, quality) {

    let stickerMetadata = {
        type: 'crop',
        pack: packName,
        author: authorName,
        quality
    }

    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()

}

async function sendAiSticker(conn, m, buffer) {

    const media = await prepareWAMessageMedia(
        {
            sticker: buffer
        },
        {
            upload: conn.waUploadToServer
        }
    )

    let msg = media.stickerMessage

    msg.isAiSticker = true
    msg.premium = 0
    msg.isAnimated = false
    msg.isLottie = false

    msg.contextInfo = {
        stanzaId: m.key.id,
        participant: m.sender,
        remoteJid: m.chat,
        quotedMessage: {
            conversation: m.text || ''
        }
    }

    await conn.relayMessage(
        m.chat,
        {
            stickerMessage: msg
        },
        {
            messageId: null
        }
    )

}