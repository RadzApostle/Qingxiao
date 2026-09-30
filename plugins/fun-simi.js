import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Contoh: ${usedPrefix + command} halo`
    try {
        let res = await fetch(`https://api.nexray.web.id/ai/simisimi?text=${encodeURIComponent(text)}`)
        let json = await res.json()
        if (json.status) {
            await conn.sendMessage(m.chat, { text: json.result }, { quoted: m })
        } else {
            throw 'Gagal mendapatkan respon dari Simi.'
        }
    } catch (e) {
        throw 'Terjadi kesalahan sistem.'
    }
}

handler.help = ['simi']
handler.tags = ['fun']
handler.command = ['simi', 'simisimi']

export default handler