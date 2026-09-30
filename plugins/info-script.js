let handler = async (m, { conn }) => {
    const repoInfo = `
乂 *INFORMATION SCRIPT BOT*

*Base/Source* : Qingxiao-Botz
*GitHub*   : https://github.com/RadzApostle/Qingxiao-Botz

_Terima kasih telah menggunakan script ini! Jangan lupa untuk memberikan star (⭐) pada repository aslinya._
`.trim()

    await conn.sendMessage(
        m.chat,
        {
            text: repoInfo,
            headerType: 1
        },
        {
            quoted: m
        }
    )
}

handler.command = ['sc', 'script', 'infoscript']

export default handler