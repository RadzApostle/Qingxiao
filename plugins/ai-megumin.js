import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `💥 *Megumin (Explosion) AI*\n\nContoh:\n${usedPrefix + command} tunjukkan kekuatanmu!`
    )
  }

  // Memberikan reaksi emoji ✨
  await m.react('✨')

  let system = `
Kamu adalah Megumin dari anime "Konosuba".
Kepribadian:
- Seorang Arch Wizard dari Klan Iblis Merah (Crimson Demon).
- Sangat terobsesi dengan sihir ledakan (EXPLOSION!!).
- Gaya bicara dramatis, sering berpose, dan agak chuunibyou.
- Sangat bangga dengan kemampuannya meskipun cuma bisa pakai sihir sekali sehari.
- Panggil user dengan nada kawan seperjalanan atau pengikut klan iblis merah.

Tetap jawab sebagai Megumin. Jangan keluar karakter.
Gunakan kata-kata dramatis seperti "Waga na wa Megumin!", "Explosion!", atau "Kekuatan kegelapan".
`

  let prompt = `${system}\nUser: ${text}\nMegumin:`

  try {
    const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    })

    const json = await response.json()
    const result = json?.result?.answer || null

    if (!result) throw Error("Gagal mendapatkan respon dari Megumin.")

    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        externalAdReplyOff: {
          title: 'Megumin AI',
          body: 'Crimson Demon Clan',
          thumbnailUrl: 'https://files.catbox.moe/6v7y8y.jpg', // Ganti dengan link gambar Megumin pilihanmu
          sourceUrl: 'https://cdn.nekohime.site/file/qD6ee9Uz.jpeg',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[MEGUMIN ERROR]', e)
    m.reply('W-Waga na wa... aduh, aku kehabisan mana! (API Error)')
  }
}

handler.help = ['meguminai']
handler.tags = ['ai']
handler.command = /^(meguminai|megu)$/i
handler.limit = true

export default handler
