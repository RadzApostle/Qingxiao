/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import fs from "fs"
import path from "path"
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

let Radz = async (m, { conn }) => {
    let msg = m.quoted ? m.quoted : m
    let mime = (msg.msg || msg).mimetype || ""

    if (!mime.includes("video")) throw "Reply atau kirim video dengan caption .ptv"

    let stream = await downloadContentFromMessage(msg.msg || msg, "video")
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    let filename = path.join("./tmp", Date.now() + ".mp4")
    fs.writeFileSync(filename, buffer)

    await conn.sendMessage(
        m.chat,
        {
            video: { url: filename },
            ptv: true
        },
        { quoted: m }
    )

    fs.unlinkSync(filename)
}

Radz.help = ["ptv"]
Radz.tags = ["tools"]
Radz.command = ["ptv"]
Radz.limit = false

export default Radz