import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`Example: ${usedPrefix}${command} 62`)

  try {
    let url = API('lol', '/api/callingcode/' + text)
    let res = await fetch(url)
    let json = await res.json()

    if (json.status !== 200) throw 'API Error'

    let d = json.result

    let msg = `
📞 *Calling Code Information*

🌍 Negara      : ${d.name}
📱 Kode Telp   : +${d.callingCodes.join(', ')}
🏙️ Ibu Kota    : ${d.capital}
🗺️ Region      : ${d.region}
🔖 ISO2        : ${d.alpha2Code}
🔖 ISO3        : ${d.alpha3Code}
🌐 Domain      : ${d.topLevelDomain.join(', ')}
`.trim()

    m.reply(msg)

  } catch (e) {
    m.reply('Kode tidak ditemukan atau API sedang error')
  }
}

handler.help = ['callingcode <kode>']
handler.tags = ['info']
handler.command = /^callingcode$/i
handler.limit = true

export default handler