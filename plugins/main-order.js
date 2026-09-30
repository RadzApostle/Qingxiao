const orders = {
'3': { name: '3 Day Premium', price: 'Rp. 3.000' },
'7': { name: '7 Day Premium', price: 'Rp. 10.000' },
'30': { name: '30 Day Premium', price: 'Rp. 15.000' },
'60': { name: '60 Day Premium', price: 'Rp. 30.000' },
'90': { name: '90 Day Premium', price: 'Rp. 40.000' },
'365': { name: '365 Day Premium', price: 'Rp. 115.000' },
'G7': { name: '7 Day Join Group', price: 'Rp. 2.000' },
'G30': { name: '30 Day Join Group', price: 'Rp. 5.000' },
'G365': { name: '365 Day Join Group', price: 'Rp. 80.000' }
}

let handler = async (m, { conn, text }) => {
if (!text) {
return await conn.sendMessage(m.chat, {
disclaimerText: 'Qingxiao Botz',
headerText: '🌷 PREMIUM & SEWA BOT',
contentText: `Hai kak 👋

❏ Selamat datang di layanan Premium & Sewa Bot Qingxiao Botz

❏ Daftar Premium

❏ 3 → 3 Day Premium — Rp. 3.000
❏ 7 → 7 Day Premium — Rp. 10.000
❏ 30 → 30 Day Premium — Rp. 15.000
❏ 60 → 60 Day Premium — Rp. 30.000
❏ 90 → 90 Day Premium — Rp. 40.000
❏ 365 → 365 Day Premium — Rp. 115.000

❏ Daftar Sewa Group

❏ G7 → 7 Day Join Group — Rp. 2.000
❏ G30 → 30 Day Join Group — Rp. 5.000
❏ G365 → 365 Day Join Group — Rp. 80.000

❏ Cara Order

.sewa <kode>

Contoh:
.sewa 30
.sewa G30

✨ Klik tombol di bawah untuk melihat informasi dan update terbaru.`,
links: [
{
text: '📢 Channel WhatsApp',
title: 'Info & Update',
url: 'https://whatsapp.com/channel/0029VbCIz0aGk1G25EvK723R'
}
],
footerText: 'Qingxiao Botz'
}, {
quoted: m
})
}

let code = text.trim().toUpperCase()

if (!orders[code]) {
return m.reply('🌷 Kode paket tidak ditemukan.\n\n❏ Ketik .sewa untuk melihat daftar paket.')
}

let paket = orders[code]

let orderMsg = `🌷 Pesanan Baru

❏ Nama : ${m.pushName}
❏ Paket : ${paket.name}
❏ Harga : ${paket.price}
❏ Waktu : ${new Date().toLocaleString('id-ID')}

✨ Qingxiao Botz`

await m.reply(`🌷 Pesanan Berhasil Dibuat

❏ Paket : ${paket.name}
❏ Harga : ${paket.price}

❏ Pesanan telah dikirim ke Owner.
❏ Silakan tunggu konfirmasi ya.

✨ Terima kasih telah memesan.`)

let owner = Array.isArray(global.owner)
? global.owner[0]
: global.owner

owner = owner.toString().replace(/[^0-9]/g, '')

await conn.sendMessage(owner + '@s.whatsapp.net', {
text: orderMsg
})
}

handler.help = ['sewa', 'premium']
handler.tags = ['main']
handler.command = /^(sewa|premium)$/i

export default handler