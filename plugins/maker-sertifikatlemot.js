/**
 * Sertifikat Lemot — Qingxiao Botz
 * Migrated: canvas → sharp + SVG
 */
import sharp from 'sharp'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

let handler = async (m, { text, conn }) => {
  const nama = text || m.pushName || 'Orang Lemot'
  const alasan = pick([
    'karena membalas chat 2 hari sekali',
    'karena loading mulu padahal sinyal 5G',
    'karena buka WA kayak nunggu sinetron tayang ulang',
    'karena suka bales "iya" 3 minggu kemudian',
    'karena kecepatan responnya ngalahin kura-kura pensiun'
  ])

  const W = 800, H = 600
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#f3f3f3"/>
    <rect x="20" y="20" width="${W-40}" height="${H-40}" fill="none" stroke="#555" stroke-width="5" rx="10"/>
    <rect x="30" y="30" width="${W-60}" height="${H-60}" fill="none" stroke="#888" stroke-width="1" rx="8"/>
    <text x="${W/2}" y="110" font-family="serif" font-size="38" font-weight="bold" fill="#333" text-anchor="middle">🐢 SERTIFIKAT LEMOT 🐢</text>
    <text x="${W/2}" y="150" font-family="serif" font-size="17" fill="#666" text-anchor="middle">Dengan bangga dipersembahkan kepada</text>
    <text x="${W/2}" y="225" font-family="serif" font-size="50" font-weight="bold" fill="#222" text-anchor="middle">${esc(nama)}</text>
    <line x1="150" y1="255" x2="${W-150}" y2="255" stroke="#999" stroke-width="2"/>
    <text x="${W/2}" y="310" font-family="sans-serif" font-size="17" fill="#444" text-anchor="middle">Terbukti secara sah dan meyakinkan</text>
    <text x="${W/2}" y="345" font-family="sans-serif" font-size="16" fill="#444" text-anchor="middle">${esc(alasan)}</text>
    <text x="${W/2}" y="430" font-family="sans-serif" font-size="16" fill="#888" text-anchor="middle">Ditetapkan pada ${esc(today)}</text>
    <circle cx="${W/2}" cy="510" r="55" fill="none" stroke="#555" stroke-width="4"/>
    <text x="${W/2}" y="503" font-family="sans-serif" font-size="14" fill="#555" text-anchor="middle" font-weight="bold">Qingxiao Botz</text>
    <text x="${W/2}" y="523" font-family="sans-serif" font-size="12" fill="#555" text-anchor="middle">QINGXIAO BOTZ</text>
    <text x="${W-16}" y="${H-12}" font-family="sans-serif" font-size="12" fill="#ccc" text-anchor="end">✦ Qingxiao Botz</text>
  </svg>`

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
  await conn.sendFile(m.chat, buffer, 'sertifikat-lemot.png', '🐢 Sertifikat Lemot dari Qingxiao Botz!', m)
}

handler.help = ['sertifikatlemot']
handler.tags = ['maker']
handler.command = /^sertifikatlemot$/i
handler.limit = true

export default handler
