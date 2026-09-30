/**
 * Sertifikat Cinta — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */
import sharp from 'sharp'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

let handler = async (m, { text, conn }) => {
  const nama = text || m.pushName || 'Kamu'
  const alasan = pick([
    'karena terlalu tampan hingga memicu pemanasan global',
    'karena senyumnya bikin resah warga +62',
    'karena cinta palsunya berhasil menyakiti banyak hati',
    'karena telah membuat 7 dari 10 orang gagal move on',
    'karena berhasil ghosting dengan cara elegan'
  ])

  const W = 800, H = 600
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fff5f5"/>
        <stop offset="100%" style="stop-color:#ffe4e4"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <!-- Border -->
    <rect x="20" y="20" width="${W-40}" height="${H-40}" fill="none" stroke="#c8102e" stroke-width="6" rx="12"/>
    <rect x="32" y="32" width="${W-64}" height="${H-64}" fill="none" stroke="#d4af37" stroke-width="2" rx="8"/>
    <!-- Title -->
    <text x="${W/2}" y="110" font-family="serif" font-size="42" font-weight="bold" fill="#c8102e" text-anchor="middle">💕 SERTIFIKAT CINTA 💕</text>
    <text x="${W/2}" y="150" font-family="serif" font-size="18" fill="#666" text-anchor="middle">Dengan bangga dipersembahkan kepada</text>
    <!-- Name -->
    <text x="${W/2}" y="225" font-family="serif" font-size="52" font-weight="bold" fill="#c8102e" text-anchor="middle">${esc(nama)}</text>
    <!-- Divider -->
    <line x1="150" y1="255" x2="${W-150}" y2="255" stroke="#d4af37" stroke-width="2"/>
    <!-- Reason -->
    <text x="${W/2}" y="310" font-family="sans-serif" font-size="17" fill="#444" text-anchor="middle">Dinyatakan bersalah</text>
    <text x="${W/2}" y="345" font-family="sans-serif" font-size="16" fill="#444" text-anchor="middle">${esc(alasan)}</text>
    <!-- Date -->
    <text x="${W/2}" y="430" font-family="sans-serif" font-size="16" fill="#888" text-anchor="middle">Ditetapkan pada ${esc(today)}</text>
    <!-- Stamp -->
    <circle cx="${W/2}" cy="510" r="55" fill="none" stroke="#c8102e" stroke-width="4"/>
    <circle cx="${W/2}" cy="510" r="48" fill="none" stroke="#c8102e" stroke-width="1"/>
    <text x="${W/2}" y="503" font-family="sans-serif" font-size="14" fill="#c8102e" text-anchor="middle" font-weight="bold">Qingxiao Botz</text>
    <text x="${W/2}" y="523" font-family="sans-serif" font-size="12" fill="#c8102e" text-anchor="middle">QINGXIAO BOTZ</text>
    <!-- Watermark -->
    <text x="${W-16}" y="${H-12}" font-family="sans-serif" font-size="12" fill="#ccc" text-anchor="end">✦ Qingxiao Botz</text>
  </svg>`

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
  await conn.sendFile(m.chat, buffer, 'sertifikat-cinta.png', '💕 Sertifikat Cinta dari Qingxiao Botz!', m)
}

handler.help = ['sertifikatcinta']
handler.tags = ['maker']
handler.command = /^sertifikatcinta$/i
handler.limit = true

export default handler
