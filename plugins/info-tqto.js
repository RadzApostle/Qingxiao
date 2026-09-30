// gausah hapus credit mending tambahin aja nama lu di list

import fs from 'fs'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    const urlB = 'https://github.com/RadzApostle'

    const thumb = fs.readFileSync('./media/thumbnail.jpg')

    const { imageMessage: image } = await prepareWAMessageMedia({
        image: thumb
    }, {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
    })

    image.width = 1280
    image.height = 720

    const teks = `
❏ Nana
❏ Kyu
❏ Ham
❏ han
❏ Renz 
❏ Rin
❏ Kano
❏ kaizen
❏ Fikri 
❏ Ryu 

❏ ShirokamiRyzen (Penyedia Base Nao MD)
❏ ItsLiaaa (Penyedia Baileys)

❏ Penyedia Layanan API
❏ Penyedia Server/VPS

❏ Contributor
❏ Tester

❏ RadzApostle (Creator Qingxiao Botz)

❏ Semua Supporter
❏ Semua User Qingxiao Botz
`.trim()

    await conn.sendMessage(m.chat, {
        text: `${urlB}\n\n${teks}`,
        linkPreview: {
            'matched-text': urlB,
            title: 'Qingxiao Botz',
            description: 'Qingxiao Botz',
            previewType: 0,
            jpegThumbnail: thumb,
            highQualityThumbnail: image,
            linkPreviewMetadata: {
                linkMediaDuration: 0,
                socialMediaPostType: 4
            }
        }
    }, { quoted: m })
}

handler.help = ['tqto']
handler.tags = ['info']
handler.command = /^(tqto|thanks|credit|credits)$/i

export default handler