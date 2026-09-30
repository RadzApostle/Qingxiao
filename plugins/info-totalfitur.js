let handler = async (m, { conn }) => {
  try {
    const totalPlugin = Object.keys(global.plugins).length

    const totalFitur = Object.values(global.plugins)
      .filter(v => v.help && v.tags && !v.disabled)
      .flatMap(v => v.help)
      .length

    await conn.sendMessage(m.chat, {
      disclaimerText: 'Information System',

      headerText: '## Total Plugin & Fitur',

      contentText: 'Statistik bot saat ini.',

      title: 'Qingxiao Botz',

      table: [
        ['', 'Jumlah'],
        ['Total Plugin', String(totalPlugin)],
        ['Total Fitur', String(totalFitur)]
      ],

      noHeading: false
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Terjadi error.')
  }
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
handler.limit = false

export default handler