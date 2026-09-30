let handler = async (m, { conn, text }) => {
    if (!text) throw 'Who wants to be banned? Provide the user\'s phone number and reason.'
    let parts = text.split(' ')
    let phoneNumber = parts[0].replace(/[^0-9]/g, '') // Remove non-numeric characters
    let reason = parts.slice(1).join(' ') || '' // Join the remaining parts as the reason, or set to empty string if not provided

    let who = phoneNumber + '@s.whatsapp.net'
    let users = global.db.data.users

    // Auto-create user record if not in database so ban always works
    if (!users[who]) users[who] = { limit: 100, exp: 0, level: 0, registered: false, premium: false, premiumTime: 0 }
    users[who].banned = true
    users[who].banReason = reason
    conn.reply(m.chat, `Banned user\n\n${reason ? 'Reason: ' + reason : 'No reason'}`, m)
}

handler.help = ['ban']
handler.tags = ['owner']
handler.command = /^ban(user)?$/i
handler.rowner = true

export default handler
