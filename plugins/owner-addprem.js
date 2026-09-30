let handler = async (m, { conn, args, usedPrefix, command }) => {

  let who

  if (/add|tambah|\+/.test(command)) {

    if (args.length < 1 && !m.quoted && !m.mentionedJid[0])
      throw `Contoh:
${usedPrefix + command} 30 628xxx
${usedPrefix + command} 30 @tag
(reply user)`

    let hari = args[0]

    if (m.mentionedJid[0]) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else if (args[1]) {
      let nomor = args[1].replace(/[^0-9]/g, '')
      who = nomor + '@s.whatsapp.net'
    }

    if (!who) throw 'User tidak ditemukan'

    if (!global.db.data.users[who]) {
      global.db.data.users[who] = {
        name: await conn.getName(who) || 'Unknown',
        limit: 10,
        exp: 0,
        level: 0,
        register: false,
        premium: false,
        premiumTime: 0
      }
    }

    let user = global.db.data.users[who]
    let now = Date.now()

    if (hari.toLowerCase() === 'permanen') {
      user.premium = true
      user.premiumTime = Infinity

      return conn.sendMessage(m.chat, {
        text:
`🪄 *Success*

👤 User : @${who.split('@')[0]}
💜 Status : Premium Permanen
🌙 Tanggal : ${new Date().toLocaleDateString('id-ID')}`,
        mentions: [who]
      }, { quoted: m })
    }

    if (isNaN(hari)) throw 'Durasi harus angka!'

    let ms = 86400000 * parseInt(hari)

    if (user.premiumTime && user.premiumTime > now) {
      user.premiumTime += ms
    } else {
      user.premiumTime = now + ms
    }

    user.premium = true

    let expired = new Date(user.premiumTime).toLocaleDateString('id-ID')

    return conn.sendMessage(m.chat, {
      text:
`✨ *Premium Aktif*

👤 User : @${who.split('@')[0]}
⏳ Durasi : ${hari} Hari
🌙 Berakhir : ${expired}`,
      mentions: [who]
    }, { quoted: m })
  }

  if (/del|hapus|-/.test(command)) {

    if (!m.mentionedJid[0] && !m.quoted && !args[0])
      throw `Contoh:
${usedPrefix + command} 628xxx
${usedPrefix + command} @tag
(reply user)`

    if (m.mentionedJid[0]) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else {
      let nomor = args[0].replace(/[^0-9]/g, '')
      who = nomor + '@s.whatsapp.net'
    }

    if (!global.db.data.users[who]) throw 'User tidak ada di database'

    let user = global.db.data.users[who]

    user.premium = false
    user.premiumTime = 0

    return conn.sendMessage(m.chat, {
      text:
`⚠️ *Premium Dihapus*

👤 User : @${who.split('@')[0]}
🌙 Status sudah nonaktif`,
      mentions: [who]
    }, { quoted: m })
  }

}

handler.help = ['addprem', 'delprem']
handler.tags = ['owner']
handler.command = /^(add|tambah|\+|del|hapus|-)p(rem)?$/i
handler.owner = true

export default handler