let handler = async (m) => {
  let qingxiao = `
*「 🎸 Qingxiao Botz 」*

Hmph... apa sih, manggil-manggil Qingxiao segala... 🙄 🙄
Yasudah, kalau kamu *beneran* butuh, ketik aja *.menu* ✨

(Tapi jangan ganggu aku lagi latihan bass, ya...) 😏
`

  m.reply(qingxiao)
}

handler.customPrefix = /^(tes|bot|qingxiao|test)$/i
handler.command = new RegExp

export default handler