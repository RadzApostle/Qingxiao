/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
* Diintegrasikan ke Qingxiao Botz oleh RadzApostle
*/

// Menggunakan global.db.data.sticker (database Qingxiao Botz)
// Database sudah diinisialisasi di main.js: db.data = { sticker: {}, ... }

const Radz = async (m, { text, usedPrefix, command }) => {
  // Pastikan db.data.sticker tersedia
  if (!global.db.data.sticker) global.db.data.sticker = {}
  const stickerDb = global.db.data.sticker

  if (command === 'setcmd' || command === 'addcmd') {
    if (!m.quoted) return m.reply('Reply foto, video, atau sticker yang ingin diberi command')
    if (!text) return m.reply(`Format salah. Contoh: ${usedPrefix + command} menu`)
    const raw = m.quoted.fileSha256
    const hash = Buffer.isBuffer(raw) ? raw.toString('base64') : String(raw || '')
    if (!hash) return m.reply('Gagal mengambil hash media')
    stickerDb[hash] = {
      text: text.trim(),
      mentionedJid: m.mentionedJid || [],
      creator: m.sender,
      at: Date.now(),
      locked: false
    }
    global.db.write().catch(console.error)
    return m.reply('Command berhasil dipasangkan ke media')
  }

  if (command === 'delcmd') {
    if (!text && !m.quoted) return m.reply('Reply media atau ketik nomor urutan dari listcmd untuk menghapus')

    let hash = ''
    if (m.quoted) {
      const raw = m.quoted.fileSha256
      hash = Buffer.isBuffer(raw) ? raw.toString('base64') : String(raw || '')
    } else if (text && !isNaN(text)) {
      const index = parseInt(text) - 1
      const keys = Object.keys(stickerDb)
      if (keys[index]) hash = keys[index]
    }

    if (!hash) return m.reply('Gagal menemukan hash media atau urutan tidak valid')
    if (!stickerDb[hash]) return m.reply('Media tidak terdaftar di database')
    if (stickerDb[hash].locked) return m.reply('Kamu tidak memiliki izin untuk menghapus command stiker ini')

    delete stickerDb[hash]
    global.db.write().catch(console.error)
    return m.reply('Command berhasil dihapus')
  }

  if (command === 'getcmd') {
    if (!m.quoted) return m.reply('Reply foto, video, atau sticker untuk melihat detail command-nya')
    const raw = m.quoted.fileSha256
    const hash = Buffer.isBuffer(raw) ? raw.toString('base64') : String(raw || '')
    if (!hash) return m.reply('Gagal mengambil hash media')
    const cmd = stickerDb[hash]
    if (!cmd) return m.reply('Media ini tidak memiliki command terdaftar')
    return m.reply(`Command: ${cmd.text}\nDibuat oleh: ${cmd.creator}\nPada: ${new Date(cmd.at).toLocaleString()}`)
  }

  if (command === 'listcmd') {
    const list = Object.entries(stickerDb)
    if (list.length === 0) return m.reply('Tidak ada cmd yang terdaftar.')
    let txt = '*DAFTAR CMD*\n```\n'
    let index = 1
    for (const [hash, data] of list) {
      txt += `${index++}. ${data.locked ? '(Terkunci) ' : ''}${hash} : ${data.text}\n`
    }
    txt += '```'
    return m.reply(txt.trim())
  }

  if (command === 'lockcmd' || command === 'unlockcmd') {
    if (!m.quoted) return m.reply('Tag pesan media yang ingin di-lock/unlock!')
    const raw = m.quoted.fileSha256
    const hash = Buffer.isBuffer(raw) ? raw.toString('base64') : String(raw || '')
    if (!hash) return m.reply('SHA256 Hash Missing')
    if (!(hash in stickerDb)) return m.reply('Hash tidak ditemukan di database')
    stickerDb[hash].locked = command === 'lockcmd'
    global.db.write().catch(console.error)
    return m.reply(`Command berhasil di-${command === 'lockcmd' ? 'lock' : 'unlock'}!`)
  }
}

Radz.help = ['setcmd <teks>', 'delcmd', 'getcmd', 'listcmd', 'lockcmd', 'unlockcmd']
Radz.tags = ['database']
Radz.command = /^(setcmd|addcmd|delcmd|getcmd|listcmd|lockcmd|unlockcmd)$/i
Radz.owner = true

export default Radz
