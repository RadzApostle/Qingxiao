import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn, text }) => {
  let [name, quote] = text.split('|').map(v => v.trim())
  if (!name || !quote) {
    throw 'Penggunaan: .fakexnxx <nama> | <quote>\nContoh: .fakexnxx zenn | Hai nama saya zen.'
  }

  let apiUrl = `https://api.siputzx.my.id/api/m/fake-xnxx?name=${encodeURIComponent(name)}&quote=${encodeURIComponent(quote)}&likes=999`

  let res = await fetch(apiUrl)
  let contentType = res.headers.get('content-type')

  if (contentType.includes('application/json')) {
    let json = await res.json()
    if (!json.status) throw json.error || 'Gagal membuat gambar.'
    if (!json.result?.url) throw 'Gagal mendapatkan URL gambar.'
    
    await conn.sendMessage(m.chat, {
      image: { url: json.result.url },
      caption: `Selesai!\n\nNama: ${name}\nQuote: ${quote}`,
      contextInfo: {
        externalAdReplyOffOffOff: {
          title: 'Fake XNXX',
          body: name,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: apiUrl
        }
      }
    }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: `Selesai!\n\nNama: ${name}\nQuote: ${quote}`,
      contextInfo: {
        externalAdReplyOffOffOff: {
          title: 'Fake XNXX',
          body: name,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: apiUrl
        }
      }
    }, { quoted: m })
  }
}

handler.help = ['fakexnxx <nama> | <quote>']
handler.tags = ['maker']
handler.command = /^fakexnxx$/i

export default handler