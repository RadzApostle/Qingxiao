let handler = async (m, { conn, isOwner, isPrems }) => {
  let who

  if (m.isGroup) {
    who = m.mentionedJid?.[0] || m.sender
  } else {
    who = m.sender
  }

  // Auto-create user if not yet in database
  if (typeof global.db.data.users[who] !== 'object' || !global.db.data.users[who]) {
    global.db.data.users[who] = { limit: 100, exp: 0, level: 0, registered: false, premium: false, premiumTime: 0 }
  }
  const user = global.db.data.users[who]

  const name = user.registered
    ? user.name
    : await conn.getName(who)

  const limitNow = user.limit || 0

  await conn.sendMessage(m.chat, {
    disclaimerText: 'User Limit Information',
    headerText: `## ${name}`,
    contentText: '---',
    title: 'User Limit',
    table: [
      ['', 'Info'],
      [
        '🍰 Name',
        name
      ],
      [
        '🍓 Status',
        isOwner
          ? 'Owner'
          : isPrems
            ? 'Premium User'
            : user.level > 999
              ? 'Elite User'
              : 'Free User'
      ],
      [
        '✨ Limit',
        isPrems
          ? 'Unlimited'
          : `${limitNow}`
      ]
    ],
    noHeading: false,
    footerText: '✨ Qingxiao Botz'
  }, {
    quoted: m
  })
}

handler.help = ['limit']
handler.tags = ['xp']
handler.command = /^(limit)$/i
handler.register = false

export default handler