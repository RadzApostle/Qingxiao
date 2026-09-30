let handler = async (m, { conn, args }) => {
    const who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : args[0]
        ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        : m.sender

    // Auto-create user if not yet in database
    if (typeof global.db.data.users[who] !== 'object' || global.db.data.users[who] === null) {
        global.db.data.users[who] = { exp: 0, level: 0, limit: 100, registered: false, premium: false, premiumTime: 0 }
        console.log(`[DB] User auto-created: ${who}`)
    }
    const user = global.db.data.users[who]

    if (!args[1]) return m.reply(`Contoh:\n.addexp @tag 500\n.addexp 62812xxxx 1000`)

    let jumlah = parseInt(args[1])
    if (isNaN(jumlah)) return m.reply('Jumlah harus angka.')

    if (!user.exp) user.exp = 0
    user.exp += jumlah

    conn.reply(m.chat,
        `✨ Berhasil menambah *${jumlah} EXP* ke @${who.split('@')[0]}\nTotal EXP: *${user.exp}*`,
        m,
        { mentions: [who] }
    )
}

handler.help = ['addexp @user/nomor jumlah']
handler.tags = ['owner','rpg']
handler.command = /^addexp$/i
handler.rowner = true
handler.rpg = true

export default handler