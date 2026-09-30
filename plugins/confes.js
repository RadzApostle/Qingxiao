/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

let Radz = async (m, { conn, text, command, usedPrefix }) => {
    global.db.data = global.db.data || {}
    global.db.data.menfess = global.db.data.menfess || {}

    let text1 = text ? text.split('|')[0] : ''
    let text2 = text ? text.split('|')[1] : ''

    switch (command) {
        case 'menfes':
        case 'menfess':
        case 'confes':
        case 'confess':
            if (Object.values(global.db.data.menfess).find(room => room.id.startsWith('menfes') && [room.a, room.b].includes(m.sender))) {
                return m.reply(`Kamu masih berada dalam sesi menfes\nketik ${usedPrefix}stopmenfes untuk stop menfes`)
            }
            if (!text || !text.includes('|')) {
                return m.reply(`Kirim Perintah ${usedPrefix + command} nomor|pesan\n\nContoh :\n${usedPrefix + command} +62xxx|Halo`)
            }
            let crush = text1.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            if (Object.values(global.db.data.menfess).find(room => room.id.startsWith('menfes') && [room.a, room.b].includes(crush))) {
                return m.reply(`Orang yang kamu menfes sedang menfes bersama orang lain :)`)
            }
            if (crush.startsWith('0')) {
                return m.reply(`Awali nomor dengan +62`)
            }
            let cekno = await conn.onWhatsApp(crush)
            if (cekno.length === 0) {
                return m.reply(`Masukkan nomor yang valid dan terdaftar di WhatsApp!`)
            }
            if (crush === m.sender) {
                return m.reply(`Tidak bisa menfes diri sendiri!`)
            }
            if (crush === conn.user.jid) {
                return m.reply(`Tidak bisa menfes bot!`)
            }
            let teks_menfes = `Hi 👋 ada menfess nih buat kamu

Pesan : ${text2}

*Balas (Y/N)* untuk menerima atau menolak menfes

_Pesan ini bersifat Rahasia dan Privasi_
_Bot hanya menyampaikan saja_`
            let id = 'menfes_' + Date.now()
            global.db.data.menfess[id] = {
                id: id,
                a: m.sender,
                b: crush,
                status: 'WAITING'
            }
            await conn.sendMessage(crush, { text: teks_menfes })
            await m.reply(`Pesan terkirim ke @${crush.split('@')[0]}\nSilahkan tunggu balasannya!`)
            break

        case 'stop':
        case 'stopmenfess':
        case 'stopmenfes':
        case 'stopconfes':
            let room = Object.values(global.db.data.menfess).find(room => room.id.startsWith('menfes') && [room.a, room.b].includes(m.sender))
            if (!room) {
                return m.reply('Belum ada sesi menfes!')
            }
            let tujuan = room.a === m.sender ? room.b : room.a
            await conn.sendMessage(tujuan, { text: `_Teman chat kamu telah menghentikan menfes ini_` })
            await conn.sendMessage(m.chat, { text: '_Menfes berhasil di Berhentikan!_' }, { quoted: m })
            delete global.db.data.menfess[room.id]
            break
        default:
    }
}

Radz.before = async function (m, { conn }) {
    global.db.data = global.db.data || {}
    global.db.data.menfess = global.db.data.menfess || {}

    if (!m.fromMe && !m.isGroup) {
        let room = Object.values(global.db.data.menfess).find(room => room.status === 'WAITING' && [room.a, room.b].includes(m.sender))
        let teks_menfes = `_Chat Sudah Terhubung Otomatis ✓_
_Sekarang kamu dapat mengirim pesan_
_Atau bisa kirim media seperti_
_Sticker/Audio/Video/Image/VN_

_Dilarang Spam Room Chat_
_Ketahuan : Banned_

_Jika pesan kamu direaction : 📨_
_Tandanya pesan kamu terkirim ke target_

_Ketik /stopmenfes untuk Berhenti menfess_`

        if (room && m.sender === room.b && room.status === 'WAITING') {
            if (m.text.toLowerCase() === 'y') {
                room.status = 'CHATTING'
                await conn.sendMessage(room.a, { text: teks_menfes })
                await conn.sendMessage(room.b, { text: teks_menfes }, { quoted: m })
            } else if (m.text.toLowerCase() === 'n') {
                await conn.sendMessage(room.b, { text: 'Menfes berhasil di tolak!' }, { quoted: m })
                await conn.sendMessage(room.a, { text: `@${room.b.split('@')[0]} menolak menfes kamu :(` })
                delete global.db.data.menfess[room.id]
            } else {
                return m.reply(`Mohon masukkan keyword dengan benar!\n\nKirim Y untuk menerima menfes dan kirim N untuk menolak menfes`)
            }
        }
    }

    if (!m.fromMe && !m.isGroup) {
        let room = Object.values(global.db.data.menfess).find(room => [room.a, room.b].includes(m.sender) && room.status === 'CHATTING')
        if (room) {
            let other = room.a === m.sender ? room.b : room.a
            let mtype = m.mtype

            if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
                await conn.sendMessage(other, { text: m.text })
            } else {
                let buffer = m.download ? await m.download() : (conn.downloadMediaMessage ? await conn.downloadMediaMessage(m) : null)
                if (buffer) {
                    if (/image/.test(mtype)) {
                        await conn.sendMessage(other, { image: buffer, caption: m.text || '' })
                    } else if (/video/.test(mtype)) {
                        await conn.sendMessage(other, { video: buffer, caption: m.text || '' })
                    } else if (/audio/.test(mtype)) {
                        await conn.sendMessage(other, { audio: buffer, ptt: m.msg.ptt || false })
                    } else if (/sticker/.test(mtype)) {
                        await conn.sendMessage(other, { sticker: buffer })
                    } else if (/document/.test(mtype)) {
                        await conn.sendMessage(other, { document: buffer, mimetype: m.msg.mimetype, fileName: m.msg.fileName || 'document' })
                    }
                }
            }
            await m.react('✉️')
        }
    }
}

Radz.tags = ['main']
Radz.help = ['menfes', 'confes', 'stopconfes']
Radz.command = /^(menfe(s|ss)|confe(s|ss)|stop(menfes|menfess|confes|confess))$/i
Radz.register = false
Radz.private = true
Radz.except = true

export default Radz