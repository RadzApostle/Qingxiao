const handler = async (m, { conn, text, usedPrefix, command }) => {
  const query = text ? text : 'halo'

  try {
    const res = await fetch(`https://farel.eu.cc/api/gpt?prompt=${encodeURIComponent(query)}`)
    const json = await res.json()

    if (!json.status) {
      throw 'Gagal mendapatkan respons dari API.'
    }

    await m.reply(json.answer)
  } catch (err) {
    return m.reply(`Terjadi kesalahan: ${err.message || err}`)
  }
}

handler.help = ['ai', 'gpt']
handler.tags = ['ai', 'internet']
handler.command = /^(ai|gpt)$/i

export default handler