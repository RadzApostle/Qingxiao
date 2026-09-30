import axios from 'axios'

async function pinterestApi(query) {
  try {
    const { data } = await axios.get(
      `https://api.nexray.eu.cc/search/pinterest?q=${encodeURIComponent(query)}`
    )

    if (!data?.status) return []

    return data.result
      .map((v, i) => ({
        title: v.grid_title || `Gambar ${i + 1}`,
        image: v.images_url
      }))
      .filter(v => v.image)

  } catch (e) {
    console.log('Pinterest Error:', e)
    return []
  }
}

let handler = async (m, { conn, text }) => {

  if (!text) {
    return m.reply('✨ Mau cari apa di Pinterest?')
  }

  await m.reply('🔎 Sedang mencari gambar Pinterest...')

  try {

    let results = await pinterestApi(text)

    if (!results.length) {
      return m.reply('❌ Tidak ada hasil ditemukan')
    }

    let album = results.slice(0, 10).map(v => ({
      image: {
        url: v.image
      },

      caption:
`📌 ${v.title}

Qingxiao Botz`
    }))

    await conn.sendMessage(m.chat, {
      album
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal mengambil hasil Pinterest.')
  }
}

handler.command = /^(pinterest|pin)$/i
handler.help = ['pinterest <query>']
handler.tags = ['internet']
handler.register = true
handler.limit = true

export default handler