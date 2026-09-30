/**
 * Store Done Receipt — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */
import sharp from 'sharp'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const handler = async (m, { text, conn }) => {
  if (!text || !text.includes(',')) {
    return m.reply('❗ Format salah!\nContoh: .done barang,harga,pembayaran')
  }

  const [barang, harga, metode] = text.split(',').map(v => v.trim())
  if (!barang || !harga || !metode) {
    return m.reply('❗ Pastikan semua data terisi.')
  }

  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const W = 500, H = 380

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#0d0d0d"/>
    <rect x="0" y="0" width="${W}" height="6" fill="#d4af37"/>
    <rect x="0" y="${H-6}" width="${W}" height="6" fill="#d4af37"/>
    <text x="${W/2}" y="55" font-family="sans-serif" font-size="26" font-weight="bold" fill="#d4af37" text-anchor="middle">✦ STRUK PEMBELIAN ✦</text>
    <text x="${W/2}" y="82" font-family="sans-serif" font-size="14" fill="#888" text-anchor="middle">Qingxiao Botz — Qingxiao Botz</text>
    <line x1="40" y1="100" x2="${W-40}" y2="100" stroke="#333" stroke-width="1"/>
    <text x="50" y="140" font-family="sans-serif" font-size="15" fill="#aaa">📦 Barang</text>
    <text x="${W-50}" y="140" font-family="sans-serif" font-size="15" fill="#fff" text-anchor="end">${esc(barang)}</text>
    <text x="50" y="178" font-family="sans-serif" font-size="15" fill="#aaa">💰 Harga</text>
    <text x="${W-50}" y="178" font-family="sans-serif" font-size="15" fill="#d4af37" text-anchor="end">${esc(harga)}</text>
    <text x="50" y="216" font-family="sans-serif" font-size="15" fill="#aaa">💳 Metode</text>
    <text x="${W-50}" y="216" font-family="sans-serif" font-size="15" fill="#fff" text-anchor="end">${esc(metode)}</text>
    <text x="50" y="254" font-family="sans-serif" font-size="15" fill="#aaa">🕐 Waktu</text>
    <text x="${W-50}" y="254" font-family="sans-serif" font-size="12" fill="#888" text-anchor="end">${esc(waktu)}</text>
    <line x1="40" y1="275" x2="${W-40}" y2="275" stroke="#333" stroke-width="1"/>
    <text x="${W/2}" y="315" font-family="sans-serif" font-size="20" font-weight="bold" fill="#c8102e" text-anchor="middle">✅ TRANSAKSI BERHASIL</text>
    <text x="${W/2}" y="350" font-family="sans-serif" font-size="12" fill="#555" text-anchor="middle">✦ Qingxiao Botz — RadzApostle</text>
  </svg>`

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
  await conn.sendFile(m.chat, buffer, 'struk.png', '✅ Struk Pembelian', m)
}

handler.help = ['done <barang,harga,metode>']
handler.tags = ['owner']
handler.command = /^done$/i
handler.owner = true

export default handler
