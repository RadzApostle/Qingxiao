import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'

/* ==========================================================
 *                          WAKTU
 * =================================================         */
let wibh = moment.tz('Asia/Jakarta').format('HH')
let wibm = moment.tz('Asia/Jakarta').format('mm')
let wibs = moment.tz('Asia/Jakarta').format('ss')
let wktuwib = `${wibh} H ${wibm} M ${wibs} S`

let d = new Date(new Date() + 3600000)
let locale = 'id'
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
})

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

/* ==========================================================
 *                      MAIN & OWNER INFO
 * =================================================         */
global.owner = [['6288294268470', 'RadzApostle', true]]
global.mods = []
global.prems = []

global.nomorbot = '6285951477548'
global.nomorown = '6288294268470'
global.nameown = 'RadzApostle'
global.version = '2.0.0'

/* ==========================================================
 *                     PAIRING CONFIG
 * =================================================         */
global.pairing = '6285951477548'         // (Legacy, tetap dipertahankan)
global.pairingNumber = '6285951477548'   // Nomor yang digunakan untuk Pairing Code

/* true  → Tampilkan menu pilihan metode login di terminal (QR / Pairing Code)
 * false → Langsung menggunakan Pairing Code otomatis dari nomor di atas */
global.pairingMethod = false

/* ==========================================================
 *                      BOT SETTINGS
 * =================================================         */
global.autotyping = false      // Status mengetik otomatis (default: mati)
global.autorecording = false   // Status merekam otomatis (default: mati)

/* ==========================================================
 *                       WATERMARK
 * =================================================         */
global.readMore = readMore
global.author = 'RadzApostle'
global.namebot = 'Qingxiao Botz'
global.wm = 'Qingxiao Botz'
global.watermark = wm
global.botdate = `✦ DATE: ${week} ${date}\n✦ TIME: ${wktuwib}`
global.bottime = `T I M E : ${wktuwib}`
global.stickpack = `Sticker By Qingxiao Botz`
global.stickauth = `By RadzApostle`
global.week = `${week} ${date}`
global.wibb = `${wktuwib}`

/* ==========================================================
 *                     SOCIAL MEDIA
 * =================================================         */
global.sig = 'https://instagram.com/Radsevenstar'      // Instagram
global.sgh = 'https://github.com/RadzApostle'          // GitHub
global.sgc = '-'                                       // Group WhatsApp
global.sgw = '-'                                       // Website / Web
global.sdc = '-'                                       // Discord
global.sfb = 'https://facebook.com/Radsevenstar'       // Facebook
global.snh = 'https://x.com/Radsevenstar'              // Twitter / X

/* ==========================================================
 *                   CPANEL CONFIGURATION
 * =================================================         */
global.egg = "15"      // ID Egg Panel (Jangan diubah kecuali paham)
global.nestid = "5"    // ID Nest Panel (Jangan diubah kecuali paham)
global.loc = "1"       // ID Lokasi Server Panel (Jangan diubah kecuali paham)
global.domain = "-"    // Masukkan domain atau URL web panel Anda
global.apikey = "-"    // API Key / PLTA akun panel Anda
global.capikey = "-"   // Client API Key / PLTC akun panel Anda

/* ==========================================================
 *                        DONATION
 * =================================================         */
global.qris = './media/qris.jpg'
global.psaweria = '-'

/* ==========================================================
 *                    CHANNEL / SALURAN
 * =================================================         */
global.linkch = 'https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22'
global.chId = '120363420257820859@newsletter'
global.newsletterName = 'Qingxiao Botz'

/* ==========================================================
 *                  TAMPILAN & UI STYLING
 * =================================================         */
global.dmenut = '╭───〔 '
global.dmenub = '│ ◦ '
global.dmenub2 = '│ ✦ '
global.dmenuf = '╰────────────────\n'
global.dashmenu = '✦━━━━━━ QINGXIAO BOTZ ━━━━━━✦'
global.cmenut = '╭─〔 '
global.cmenuh = ' 〕'
global.cmenub = '│ ◦ '
global.cmenuf = '╰────────────────\n'
global.cmenua = '\n      ─── ✦ Qingxiao Botz ✦ ───\n'
global.pmenus = '✦'
global.htki = '《'
global.htka = '》'
global.lopr = 'Ⓟ'
global.lolm = 'Ⓛ'
global.htjava = '✦'
global.hsquere = ['◈', '◆', '◇']

/* ==========================================================
 *                    RESPON & MESSAGES
 * =================================================         */
global.wait = '✨ Processing aboard Qingxiao Botz...'
global.eror = '✦ Error — Trace Route Failed'

/* ==========================================================
 *                      API ENDPOINTS
 * =================================================         */
global.APIs = {
    faa: 'https://api-faa.my.id',
    lol: 'https://api.lolhuman.xyz',
    deline: 'https://api.deline.web.id'
}

global.APIKeys = {
    'https://api.lolhuman.xyz': 'ISI_APIKEY_KAMU'
}

/* ==========================================================
 *                      FLAMING TEXT
 * =================================================         */
global.fla = [
    "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=",
    "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=",
    "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=",
    "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=",
    "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23c8102e&fillColor2Color=%23c8102e&fillColor3Color=%23c8102e&fillColor4Color=%23c8102e&fillColor5Color=%23c8102e&fillColor6Color=%23c8102e&fillColor7Color=%23c8102e&fillColor8Color=%23c8102e&fillColor9Color=%23c8102e&fillColor10Color=%23c8102e&fillOutlineColor=%23d4af37&fillOutline2Color=%23d4af37&backgroundColor=%230a0a0a&text="
]

global.flaaa2 = [...global.fla]

/* ==========================================================
 *                        RPG EMOJI
 * =================================================         */
global.rpg = {
	emoticon(string) {
		string = string.toLowerCase()
		let emot = {
			level: '🧬', limit: '🌌', health: '❤️', exp: '✉️', money: '💵',
			potion: '🥤', diamond: '💎', common: '📦', uncommon: '🎁', mythic: '🗳️',
			legendary: '🗃️', pet: '🎁', trash: '🗑', armor: '🥼', sword: '⚔️',
			pickaxe: '⛏️', fishingrod: '🎣', bow: '🏹', wood: '🪵', rock: '🪨',
			string: '🕸️', horse: '🐎', cat: '🐈', dog: '🐕', fox: '🦊',
			wolf: '🐺', centaur: '🐎', phoenix: '🦜', dragon: '🐉', petfood: '🍖',
			iron: '⛓️', gold: '👑', emerald: '💚', bibitmangga: '🌾', bibitanggur: '🌾',
			bibitjeruk: '🌾', bibitpisang: '🌾', bibitapel: '🌾', mangga: '🥭',
			anggur: '🍇', jeruk: '🍊', pisang: '🍌', apel: '🍎', ayam: '🐔',
			kambing: '🐐', sapi: '🐄', kerbau: '🐃', babi: '🐖', harimau: '🐅',
			banteng: '🐂', monyet: '🐒', babihutan: '🐗', panda: '🐼', gajah: '🐘',
			buaya: '🐊', orca: '🐋', paus: '🐳', lumba: '🐬', hiu: '🦈',
			ikan: '🐟', lele: '🐟', bawal: '🐡', nila: '🐠', kepiting: '🦀',
			lobster: '🦞', gurita: '🐙', cumi: '🦑', udang: '🦐', steak: '🍝',
			sate: '🍢', rendang: '🍜', kornet: '🥣', nugget: '🍱', bluefin: '🍲',
			seafood: '🍛', sushi: '🍣', moluska: '🥘', squidprawm: '🍤', rumahsakit: '🏥',
			restoran: '🏭', pabrik: '🏯', tambang: '⚒️', pelabuhan: '🛳️'
		}
		let results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string))
		if (!results.length) return ''
		else return emot[results[0][0]]
	}
}

/* ==========================================================
 *                FILE WATCHER (AUTO RELOAD)
 * =================================================         */
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'config.js'"))
    import(`${file}?update=${Date.now()}`)
})
