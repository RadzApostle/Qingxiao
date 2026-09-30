/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import similarity from 'similarity'

let Radz = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan nama command atau file!\nContoh: *${usedPrefix + command} menu*`)

    let plugins = Object.keys(global.plugins)
    let results = []

    for (let name of plugins) {
        let plugin = global.plugins[name]
        if (!plugin) continue
        
        let help = (plugin.help || []).map(v => v.toLowerCase())
        let commands = []
        if (plugin.command) {
            if (plugin.command instanceof RegExp) {
                commands.push(plugin.command.source.toLowerCase())
            } else if (Array.isArray(plugin.command)) {
                commands = plugin.command.map(v => String(v).toLowerCase())
            } else {
                commands.push(String(plugin.command).toLowerCase())
            }
        }
        
        let filename = name.split('/').pop().toLowerCase()
        let query = text.toLowerCase()

        if (help.some(v => v.includes(query)) || 
            commands.some(v => v.includes(query)) || 
            filename.includes(query)) {
            
            let score = similarity(query, filename)
            results.push({
                filename: name.split('/').pop(),
                path: name,
                help: plugin.help ? plugin.help.join(', ') : 'Tidak ada',
                tags: plugin.tags ? plugin.tags.join(', ') : 'Tidak ada',
                score: score
            })
        }
    }

    if (results.length === 0) return m.reply(`Plugin *"${text}"* tidak ditemukan.`)

    results.sort((a, b) => b.score - a.score)

    let caption = `🔍 *RESULT*\n\n`
    for (let i = 0; i < results.length; i++) {
        let res = results[i]
        caption += `*${i + 1}. ${res.filename}*\n`
        caption += `📂 Path: \`plugins/${res.path}\`\n`
        caption += `📜 Help: ${res.help}\n`
        caption += `🏷️ Tags: ${res.tags}\n`
        caption += `───\n`
        if (i >= 15) break
    }

    m.reply(caption.trim())
}

Radz.help = ['fplugin']
Radz.tags = ['owner']
Radz.command = /^(fplugin|findplugin|fplug)$/i
Radz.owner = true

export default Radz