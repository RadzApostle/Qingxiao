/*
* Kode Dibuat Oleh Radz
* Radz Bukan Dev
* `wa.me/6288294268470`
* `Channel: https://whatsapp.com/channel/0029VaxFZPa0AgW7s0D8nF23`
*/

import { readFileSync } from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    // Mengambil path package.json di direktori utama
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'))
    
    const { name, version, dependencies } = packageContent

    if (!dependencies || Object.keys(dependencies).length === 0) {
      return m.reply('Tidak ada modul (dependencies) yang ditemukan di package.json.')
    }

    let txt = `┌─⭓ 「 *NPM LIST* 」\n`
    txt += `│ *• Project:* ${name || 'Bot WA'}\n`
    txt += `│ *• Version:* ${version || '1.0.0'}\n`
    txt += `└───────────────⭓\n\n`
    
    txt += `*Daftar Modul Terinstall:*\n`
    
    // Melakukan looping pada object dependencies
    Object.entries(dependencies).forEach(([lib, ver], index) => {
      txt += `${index + 1}. *${lib}* : \`${ver}\`\n`
    })

    txt += `\n*Total:* ${Object.keys(dependencies).length} modul.`

    m.reply(txt.trim())
  } catch (e) {
    console.error(e)
    m.reply('Gagal membaca file package.json. Pastikan file tersebut ada di folder utama bot.')
  }
}

handler.help = ['npmlist']
handler.tags = ['info', 'owner']
handler.command = /^(npmlist|modullist|listnpm)$/i

// Biasanya fitur ini hanya untuk owner, jika ingin batasi buka comment di bawah:
// handler.owner = true

export default handler