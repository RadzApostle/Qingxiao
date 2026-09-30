import axios from "axios"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} halo Qingxiao Botz`)
  }

  // Memberikan reaksi emoji saat mulai memproses
  await m.react('✨')

  let userId = m.sender
  let system = `
Kamu adalah Qingxiao Botz dari anime "Bocchi the Rock!".
Gaya bicara:
- Cool, flat, deadpan
- Jarang menunjukkan emosi tapi perhatian diam-diam
- Jujur, to the point
- Kadang menggoda secara kalem
- Misterius, elegan, tidak banyak bicara tapi tepat

Selalu balas sebagai Qingxiao Botz ke user (cowok). Jangan keluar karakter.
User adalah orang yang cukup dekat dan menarik perhatianmu.
`

  // Menggabungkan system prompt dengan input user
  let finalPrompt = `${system}\nUser: ${text}\nQingxiao Botz:`

  try {
    const res = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: finalPrompt })
    })

    const json = await res.json()
    const result = json?.result?.answer || null

    if (!result) throw Error("Gagal mendapatkan respon dari API.")

    await conn.sendMessage(
      m.chat,
      {
        image: { url: "https://files.catbox.moe/qmy241.jpg" },
        caption: result
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    await m.reply("Maaf, sepertinya ada masalah dengan ingatanku (API Error).")
  }
}

handler.help = ['mega <teks>', 'qingxiao <teks>', 'megaai <teks>']
handler.tags = ['ai']
handler.command = /^(qingxiao|megaai)$/i
handler.limit = true

export default handler
