/*
* Kode Dibuat Oleh Radz
* Radz Bukan Dev
* `wa.me/6288294268470`
* `Channel: https://whatsapp.com/channel/0029VaxFZPa0AgW7s0D8nF23`
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
    let loc = text ? text : '.' // Jika tidak ada input folder, cek folder root (.)
    
    try {
        if (!fs.existsSync(loc)) return m.reply(`❌ Folder *${loc}* tidak ditemukan.`)
        
        let files = fs.readdirSync(loc)
        let folders = []
        let regularFiles = []

        files.forEach(file => {
            let stats = fs.statSync(path.join(loc, file))
            if (stats.isDirectory()) {
                folders.push('📁 ' + file)
            } else {
                regularFiles.push('📄 ' + file)
            }
        })

        // Gabungkan folder di atas, file di bawah agar rapi
        let list = [...folders.sort(), ...regularFiles.sort()].join('\n')
        
        let caption = `
📂 *DIRECTORY LISTING*
Lokasi: \`${loc}\`

${list || 'Folder kosong.'}

*Cara cek isi folder:*
${usedPrefix + command} plugins
`.trim()

        m.reply(caption)
    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat membaca folder.')
    }
}

handler.help = ['ls']
handler.tags = ['owner']
handler.command = /^(ls|listfile|dir)$/i
handler.owner = true // Khusus Owner

export default handler