/*
 * plugins/jadibot.js
 *
 * "Jadibot" lets a user turn their own WhatsApp number into a clone of this
 * bot, using either a pairing code (default, matches main.js's login flow)
 * or QR if global.usePairingCode is set to false.
 *
 * This replaces a previous implementation that called a non-existent
 * global.Radz(msg, sock) dispatcher and built sockets without EvaBot's
 * lib/simple.js wrapper (so m.reply/conn.getName etc. would have thrown
 * inside every plugin). See lib/jadibot.js for the session manager that
 * fixes this by reusing makeWASocket() and handler.js exactly like
 * main.js does for the primary connection.
 */

import {
    startSession,
    stopSession,
    listActiveSessions,
    getSessionByOwner,
    hasActiveSession,
    sanitizeNumber,
    wipeSessionFolder,
    isCredsValid,
    findExistingSessionFolder,
    isRegisteredOwnerNumber
} from '../lib/jadibot.js'

const handler = async (m, { conn, command, args, text, isOwner }) => {
    const sub = (args[0] || '').toLowerCase()

    if (command === 'jadibot' || command === 'startjadibot') {
        // .jadibot stop / .jadibot status / .jadibot list also work as aliases
        if (sub === 'stop') return stopHandler(m, conn)
        if (sub === 'status') return statusHandler(m, conn)
        if (sub === 'list') return listHandler(m, conn, isOwner)

        const rawNumber = text?.trim() || m.sender.split('@')[0]
        const number = sanitizeNumber(rawNumber)

        if (!number || number.length < 8) {
            return m.reply(
                `❌ Format salah!\n\n` +
                `Contoh:\njadibot 628123456789\n\n` +
                `Jika tanpa nomor, bot akan menggunakan nomor WhatsApp kamu sendiri.`
            )
        }

        if (hasActiveSession(m.sender)) {
            return m.reply('⚠️ Kamu sudah memiliki sesi jadibot yang aktif. Gunakan *.stopjadibot* untuk menghentikannya terlebih dahulu.')
        }

        // Hak akses ditentukan dari nomor yang akan di-pairing (number),
        // dicocokkan ke daftar owner di config.js — bukan dari siapa yang
        // mengetik command ini.
        const willBeOwnerSession = isRegisteredOwnerNumber(number)
        const accessNote = willBeOwnerSession
            ? '👑 Nomor ini terdaftar sebagai *Owner* di config.js → sesi akan memiliki hak akses penuh (owner_jadibot).'
            : 'ℹ️ Nomor ini bukan Owner terdaftar → sesi akan berjalan sebagai pengguna biasa (user_jadibot), command owner tidak dapat digunakan.'

        await m.reply(`⏳ Menyiapkan sesi jadibot untuk *${number}*...\n\n${accessNote}\n\nKode pairing akan dikirim sebentar lagi.`)

        try {
            await startSession({ ownerJid: m.sender, number, mainConn: conn, notifyChat: m.chat })
        } catch (e) {
            return m.reply(`❌ Gagal membuat sesi jadibot: ${e.message || e}`)
        }
        return
    }

    if (command === 'stopjadibot') return stopHandler(m, conn)
    if (command === 'statusjadibot') return statusHandler(m, conn)
    if (command === 'listjadibot') return listHandler(m, conn, isOwner)

    if (command === 'delsesijadibot') {
        if (!isOwner) return m.reply('🔒 Khusus untuk Owner Bot!')
        const number = sanitizeNumber(text)
        if (!number) return m.reply('Format: delsesijadibot 628123456789')

        const activeOwner = listActiveSessions().find(s => s.number === number)
        if (activeOwner) {
            await stopSession(activeOwner.ownerJid, { wipe: true, reason: 'force cleared by owner' })
            return m.reply(`✅ Sesi aktif untuk *${number}* dihentikan dan datanya dihapus.`)
        }

        const found = findExistingSessionFolder(number)
        if (!found || !isCredsValid(found.folder)) return m.reply('ℹ️ Tidak ditemukan sesi (aktif maupun tersimpan) untuk nomor tersebut.')

        wipeSessionFolder(number, found.isOwnerSession)
        return m.reply(`✅ Data sesi tersimpan untuk *${number}* telah dihapus.`)
    }
}

async function stopHandler(m, conn) {
    const session = getSessionByOwner(m.sender)
    if (!session) return m.reply('ℹ️ Kamu tidak memiliki sesi jadibot yang aktif.')

    await m.reply('⏳ Menghentikan sesi jadibot kamu...')
    await stopSession(m.sender, { wipe: true, reason: 'stopped by user' })
    return m.reply('✅ Sesi jadibot kamu telah dihentikan dan datanya dihapus.')
}

async function statusHandler(m, conn) {
    const session = getSessionByOwner(m.sender)
    if (!session) return m.reply('ℹ️ Kamu tidak memiliki sesi jadibot yang aktif.\n\nKetik *.jadibot* untuk membuat sesi baru.')

    const statusLabel = {
        connecting: '🟡 Menghubungkan...',
        connected: '🟢 Terhubung',
        disconnected: '🔴 Terputus (mencoba menyambung ulang)',
        stopping: '⚪ Sedang dihentikan'
    }[session.status] || session.status

    const uptime = session.startedAt ? Math.floor((Date.now() - session.startedAt) / 1000) : 0
    const botJid = session.conn?.user?.id
    const accessLabel = session.isOwnerSession ? '👑 Owner (owner_jadibot)' : '👤 User biasa (user_jadibot)'

    return m.reply(
        `*STATUS JADIBOT KAMU*\n\n` +
        `• Nomor: ${session.number}\n` +
        `• Status: ${statusLabel}\n` +
        `• Akses: ${accessLabel}\n` +
        `• Berjalan selama: ${uptime}s\n` +
        (botJid ? `• Bot JID: ${botJid.split('@')[0]}\n` : '')
    )
}

async function listHandler(m, conn, isOwner) {
    if (!isOwner) return m.reply('🔒 Khusus untuk Owner Bot!')

    const sessions = listActiveSessions()
    if (!sessions.length) return m.reply('ℹ️ Tidak ada sesi jadibot yang aktif saat ini.')

    let text = `*DAFTAR JADIBOT AKTIF (${sessions.length})*\n\n`
    const mentions = []
    sessions.forEach((s, i) => {
        const statusEmoji = s.status === 'connected' ? '🟢' : s.status === 'connecting' ? '🟡' : '🔴'
        const accessTag = s.isOwnerSession ? '👑 owner_jadibot' : '👤 user_jadibot'
        text += `${i + 1}. ${statusEmoji} ${s.number} [${accessTag}] — dibuat oleh: @${s.ownerJid.split('@')[0]}\n`
        mentions.push(s.ownerJid)
    })

    return conn.sendMessage(m.chat, { text: text.trim(), mentions }, { quoted: m })
}

handler.help = [
    'jadibot [nomor]',
    'jadibot stop',
    'jadibot status',
    'jadibot list',
    'stopjadibot',
    'statusjadibot',
    'listjadibot',
    'delsesijadibot <nomor>'
]
handler.tags = ['tools']
handler.command = /^(jadibot|startjadibot|stopjadibot|statusjadibot|listjadibot|delsesijadibot)$/i
handler.premium = true

export default handler