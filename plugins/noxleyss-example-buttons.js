// ============================================================
// plugins/noxleyss-example-buttons.js
// Contoh plugin ALL TYPE BUTTON menggunakan noxleyss@latest
// ============================================================

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // ── 1. Quick Reply Button ─────────────────────────────
    if (command === 'testbtn') {
        await conn.sendInteractiveButton(
            m.chat,
            '✦ Pilih salah satu opsi di bawah:',
            '© Qingxiao Botz — noxleyss',
            null,
            [
                { type: 'reply', text: '✅ Konfirmasi', id: 'confirm' },
                { type: 'reply', text: '❌ Batalkan', id: 'cancel' },
                { type: 'reply', text: '🔄 Ulangi', id: 'retry' },
            ],
            m
        )
    }

    // ── 2. URL Button ─────────────────────────────────────
    else if (command === 'testurl') {
        await conn.sendInteractiveButton(
            m.chat,
            '🌐 Kunjungi link berikut:',
            '© Qingxiao Botz',
            null,
            [
                { type: 'url', text: '📦 NPM noxleyss', url: 'https://www.npmjs.com/noxleyss' },
                { type: 'url', text: '🐙 GitHub Baileys', url: 'https://github.com/WhiskeySockets/Baileys' },
            ],
            m
        )
    }

    // ── 3. Call Button ────────────────────────────────────
    else if (command === 'testcall') {
        await conn.sendInteractiveButton(
            m.chat,
            '📞 Hubungi kami langsung:',
            '© Qingxiao Botz',
            null,
            [
                { type: 'call', text: '📱 Customer Service', phone: '6281234567890' },
            ],
            m
        )
    }

    // ── 4. Copy Button ────────────────────────────────────
    else if (command === 'testcopy') {
        await conn.sendInteractiveButton(
            m.chat,
            '📋 Salin kode promo di bawah:',
            '© Qingxiao Botz',
            null,
            [
                { type: 'copy', text: '📋 Salin: GRATIS2024', code: 'GRATIS2024' },
            ],
            m
        )
    }

    // ── 5. Native Flow (mix semua tipe) ──────────────────
    else if (command === 'testnative') {
        await conn.sendNativeFlow(
            m.chat,
            { title: '✦ Qingxiao Botz', subtitle: 'Powered by noxleyss' },
            { text: 'Pilih aksi yang kamu inginkan:' },
            { text: '© noxleyss@latest — All Type Button' },
            [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '✅ Konfirmasi', id: 'confirm' })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({ display_text: '🌐 Buka Website', url: 'https://www.npmjs.com/noxleyss' })
                },
                {
                    name: 'cta_call',
                    buttonParamsJson: JSON.stringify({ display_text: '📞 Telpon CS', phone_number: '6281234567890' })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({ display_text: '📋 Salin Kode', copy_code: 'QINGXIAO2024' })
                },
            ],
            m
        )
    }

    // ── 6. Table A2UI (List Message) ─────────────────────
    else if (command === 'testlist') {
        await conn.sendTableA2UI(
            m.chat,
            '📋 Menu Qingxiao Botz',
            'Pilih kategori fitur yang kamu inginkan:',
            '© Qingxiao Botz v2.0.0 — noxleyss@latest',
            [
                { title: '🎮 Game', description: 'Tebak kata, quiz, RPG battle', id: 'cat_game' },
                { title: '🎵 Downloader', description: 'YouTube, TikTok, Instagram', id: 'cat_dl' },
                { title: '🤖 AI Tools', description: 'Chat AI, image generation, OCR', id: 'cat_ai' },
                { title: '📊 Info', description: 'Cuaca, kurs, jadwal sholat', id: 'cat_info' },
                { title: '🎨 Maker', description: 'Sticker, text art, thumbnail', id: 'cat_maker' },
            ],
            m,
            { buttonText: '📂 Buka Menu' }
        )
    }

    // ── 7. AiRich Text ───────────────────────────────────
    else if (command === 'testrich') {
        await conn.sendAiRich(
            m.chat,
            `# ✦ Contoh AiRich Format

*Bold Text* — teks tebal
_Italic Text_ — teks miring
~Strikethrough~ — teks coret

> Ini adalah blockquote / kutipan

\`\`\`
const noxleyss = require('noxleyss')
// Ini adalah blok kode
\`\`\`

## Sub Heading
- Item list 1
- Item list 2
- Item list 3

_Powered by noxleyss@latest_ 🚀`,
            m
        )
    }

    // ── 8. HTML Text ─────────────────────────────────────
    else if (command === 'testhtml') {
        await conn.sendHtmlText(
            m.chat,
            `<b>✦ HTML Support</b><br>
<i>Noxleyss mendukung HTML rendering</i><br><br>
<u>Fitur:</u><br>
• <b>Bold</b>, <i>italic</i>, <u>underline</u><br>
• List, heading, paragraf<br><br>
<small>Powered by noxleyss@latest</small>`,
            '✦ HTML Support — Noxleyss mendukung HTML rendering. Powered by noxleyss@latest',
            m
        )
    }
}

handler.help = ['testbtn', 'testurl', 'testcall', 'testcopy', 'testnative', 'testlist', 'testrich', 'testhtml']
handler.tags = ['noxleyss', 'test']
handler.command = /^(testbtn|testurl|testcall|testcopy|testnative|testlist|testrich|testhtml)$/i

export default handler
