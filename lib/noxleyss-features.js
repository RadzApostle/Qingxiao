// ============================================================
// lib/noxleyss-features.js — Noxleyss (lilys-baileys) Features
// Dokumentasi & helper untuk semua fitur noxleyss@latest
// Compatible dengan: Qingxiao Botz v2.0.0
// ============================================================

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         PANDUAN FITUR NOXLEYSS (lilys-baileys)          ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  npm: "npm:noxleyss@latest"                             ║
 * ║  Ganti: @whiskeysockets/baileys → npm:noxleyss@latest   ║
 * ╚══════════════════════════════════════════════════════════╝
 */

// ─── 1. AiRich — Format teks kaya (Rich Text) ────────────────────────────────
/**
 * AiRich memungkinkan teks dengan formatting khusus:
 *
 * Syntax yang didukung:
 *   *bold*          → teks tebal
 *   _italic_        → teks miring
 *   ~strikethrough~ → teks coret
 *   ```code```      → blok kode
 *   > quote         → teks kutipan
 *   # Heading 1
 *   ## Heading 2
 *   - list item
 *
 * Cara pakai di plugin:
 *   conn.sendAiRich(m.chat, `
 *   # 🤖 AI Response
 *   *Hasil:* _ini hasilnya_
 *   > Powered by Qingxiao Bot
 *   `, m)
 */

// ─── 2. HTML Support ──────────────────────────────────────────────────────────
/**
 * Noxleyss mendukung field htmlText di sendMessage.
 * Dirender di WhatsApp Business & client tertentu.
 *
 * Cara pakai:
 *   conn.sendHtmlText(m.chat,
 *     '<b>Halo!</b> <i>Selamat datang</i> di <u>bot kami</u>',
 *     'Halo! Selamat datang di bot kami',
 *     m
 *   )
 *
 * Atau langsung via sendMessage:
 *   conn.sendMessage(m.chat, {
 *     text: 'fallback text',
 *     htmlText: '<b>Bold HTML</b>'
 *   })
 */

// ─── 3. Table A2UI ───────────────────────────────────────────────────────────
/**
 * A2UI Table = Interactive List Message (menu tabel scrollable)
 *
 * Cara pakai:
 *   conn.sendTableA2UI(
 *     m.chat,
 *     'Menu Bot',
 *     'Pilih fitur yang kamu inginkan:',
 *     'Qingxiao Bot v2',
 *     [
 *       { title: '🎮 Game', description: 'Mode game interaktif', id: 'game' },
 *       { title: '🎵 Musik', description: 'Download & info musik', id: 'musik' },
 *       { title: '📚 Info', description: 'Informasi umum', id: 'info' },
 *     ],
 *     m
 *   )
 *
 * Handler respons di handler.js:
 *   if (m.listResponse) {
 *     const selectedId = m.listResponse?.singleSelectReply?.selectedRowId
 *     if (selectedId === 'game') { ... }
 *   }
 */

// ─── 4. All Type Button ───────────────────────────────────────────────────────
/**
 * Noxleyss support semua tipe button:
 *
 * TYPE 1 — Quick Reply (tombol balas cepat):
 *   conn.sendInteractiveButton(m.chat, 'Pilih menu:', 'footer', null, [
 *     { type: 'reply', text: 'Menu 1', id: 'menu1' },
 *     { type: 'reply', text: 'Menu 2', id: 'menu2' },
 *   ], m)
 *
 * TYPE 2 — URL Button (buka link):
 *   conn.sendInteractiveButton(m.chat, 'Kunjungi kami:', 'footer', null, [
 *     { type: 'url', text: 'GitHub', url: 'https://github.com' },
 *   ], m)
 *
 * TYPE 3 — Call Button (langsung telpon):
 *   conn.sendInteractiveButton(m.chat, 'Hubungi kami:', 'footer', null, [
 *     { type: 'call', text: 'Telpon', phone: '6281234567890' },
 *   ], m)
 *
 * TYPE 4 — Copy Button (salin teks):
 *   conn.sendInteractiveButton(m.chat, 'Salin kode:', 'footer', null, [
 *     { type: 'copy', text: 'Salin Kode', code: 'PROMO2024' },
 *   ], m)
 *
 * TYPE 5 — Native Flow (advanced, semua tipe campur):
 *   conn.sendNativeFlow(m.chat,
 *     { title: 'Header', subtitle: 'Sub' },
 *     { text: 'Body pesan' },
 *     { text: 'Footer' },
 *     [
 *       { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Reply', id: 'reply1' }) },
 *       { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Buka', url: 'https://example.com' }) },
 *       { name: 'cta_call', buttonParamsJson: JSON.stringify({ display_text: 'Telpon', phone_number: '6281234567890' }) },
 *       { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: 'Salin', copy_code: 'ABC123' }) },
 *     ],
 *     m
 *   )
 */

// ─── 5. No Logout Sender ─────────────────────────────────────────────────────
/**
 * Noxleyss memiliki perlindungan built-in agar nomor pengirim
 * tidak terkena logout saat mengirim pesan broadcast / blast.
 *
 * Tidak perlu konfigurasi tambahan — aktif otomatis.
 * Pastikan pakai versi: "npm:noxleyss@latest"
 */

// ─── 6. Custom Pairing Code ───────────────────────────────────────────────────
/**
 * Noxleyss mendukung custom pairing code string.
 * Sudah ditangani di lib/pairing.js — tidak perlu ubah apapun.
 *
 * Jika mau custom format pairing:
 *   const code = await conn.requestPairingCode(phoneNumber)
 *   // noxleyss: format code bisa dikustomisasi
 *   conn.sendMessage(ownerJid, { text: `Kode pairing: *${code}*` })
 */

// ─── 7. CJS & ESM Support ────────────────────────────────────────────────────
/**
 * Bot ini menggunakan ESM ("type": "module" di package.json).
 * Noxleyss support keduanya (CJS & ESM) — tidak perlu ubah apapun.
 *
 * Jika plugin pakai CJS syntax (require), gunakan:
 *   const { proto } = (await import('@whiskeysockets/baileys')).default
 *   (sudah ada di beberapa plugin, tidak perlu diubah)
 */

// ─── 8. Proto Terbaru ────────────────────────────────────────────────────────
/**
 * Noxleyss sudah include proto WhatsApp terbaru.
 * Tidak perlu update proto manual.
 *
 * Akses proto seperti biasa:
 *   import { proto } from '@whiskeysockets/baileys'
 *   const msg = proto.Message.create({ ... })
 */

// ─── EXAMPLE PLUGIN: menu.js ─────────────────────────────────────────────────
export const exampleMenuPlugin = `
// plugins/info-menu-noxleyss.js
// Contoh plugin yang memanfaatkan semua fitur noxleyss

let handler = async (m, { conn, text, command, usedPrefix }) => {
  const menu = command === 'menu' || command === 'help'

  if (menu) {
    // Kirim Table A2UI (list menu interaktif)
    await conn.sendTableA2UI(
      m.chat,
      '✦ Qingxiao Botz Menu',
      'Pilih kategori yang kamu inginkan:',
      '© Qingxiao Botz v2.0.0',
      [
        { title: '🎮 Game', description: 'Tebak kata, quiz, battle boss', id: 'menu_game' },
        { title: '🎵 Musik & Download', description: 'YouTube, TikTok, Spotify', id: 'menu_dl' },
        { title: '🤖 AI & Tools', description: 'ChatAI, image gen, OCR', id: 'menu_ai' },
        { title: '📊 Info & Cek', description: 'Cuaca, kurs, jadwal sholat', id: 'menu_info' },
        { title: '⚙️ Owner Only', description: 'Fitur admin & owner', id: 'menu_owner' },
      ],
      m
    )
  }
}

handler.help = ['menu', 'help']
handler.tags = ['info']
handler.command = /^(menu|help)$/i

export default handler
`

// ─── EXAMPLE PLUGIN: airesponse.js ───────────────────────────────────────────
export const exampleAiRichPlugin = `
// plugins/ai-richresponse.js
// Contoh penggunaan AiRich + HTML untuk respons AI

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply('Masukkan pertanyaan!')

  await conn.sendAiRich(m.chat, \`
# 🤖 AI Response

*Pertanyaan:* \${text}

*Jawaban:*
> Ini adalah jawaban dari AI dengan format rich text noxleyss.

_Catatan: Respons ini menggunakan AiRich formatting_

\`\`\`
Powered by noxleyss@latest
\`\`\`
  \`, m)
}

handler.help = ['ai <tanya>']
handler.tags = ['ai']
handler.command = /^ai$/i

export default handler
`

export default {
    version: 'noxleyss@latest',
    description: 'Feature helper untuk noxleyss (lilys-baileys)',
    features: ['AiRich', 'HTML', 'TableA2UI', 'AllTypeButton', 'NoLogout', 'CustomPairing', 'CJS+ESM', 'LatestProto']
}
