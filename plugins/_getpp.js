import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, command }) => {
    try {
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
        else who = m.quoted.sender ? m.quoted.sender : m.sender
        let pp = await conn.profilePictureUrl(who, 'image').catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
        conn.sendFile(m.chat, pp, "nih bang.png", 'Selesai....', m, { jpegThumbnail: await (await fetch(pp)).buffer() })
    } catch {
        let sender = m.sender
        let pp = await conn.profilePictureUrl(sender, 'image').catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
        conn.sendFile(m.chat, pp, 'ppsad.png', "Selesai....", m, { jpegThumbnail: await (await fetch(pp)).buffer() })
    }
}
handler.help = ['getpp <@tag/reply>']
handler.tags = ['group']
handler.command = /^(getpp)$/i

export default handler