let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    if (!m.isGroup) return m.reply('Hanya bisa di grup!')
    if (!isAdmin) return m.reply('Hanya admin yang bisa pakai!')

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (!args[0]) return m.reply(`Contoh: *${usedPrefix + command} on* atau *off*`)

    if (args[0] === 'on') {
        chat.antiBot = true
        m.reply('✅ Anti-Bot aktif!')
    } else if (args[0] === 'off') {
        chat.antiBot = false
        m.reply('❌ Anti-Bot mati!')
    }
}

handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin || m.fromMe) return 
    
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.antiBot) return 
    
    const isBot = m.key.id.startsWith('BAE5') || 
                  m.key.id.startsWith('') || 
                  m.key.id.startsWith('WA') || 
                  m.key.id.length === 16 || 
                  m.key.id.length === 15 ||
                  m.isBaileys ||
                  m.msg?.contextInfo?.externalAdReplyOffOffOff

    if (isBot) {
        try {
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            })
        } catch (e) {
            console.error(e)
        }
    }
}

handler.help = ['antibot']
handler.tags = ['group']
handler.command = ['antibot']
handler.group = true
handler.owner = true

export default handler