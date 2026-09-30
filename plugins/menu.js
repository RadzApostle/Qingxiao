import fs from 'fs'
import moment from 'moment-timezone'

moment.locale('id')

// ─── Helpers ──────────────────────────────────────────────────
function runtime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function tanggal(ms) {
  return moment(ms).tz('Asia/Jakarta').format('dddd, DD MMMM YYYY · HH:mm')
}

function getGreeting() {
  const h = moment.tz('Asia/Jakarta').hour()
  if (h < 5)  return '🌙 Selamat Dini Hari'
  if (h < 11) return '🌅 Selamat Pagi'
  if (h < 15) return '☀️ Selamat Siang'
  if (h < 18) return '🌇 Selamat Sore'
  return '🌙 Selamat Malam'
}

function formatTag(tag) {
  return tag.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Icon per kategori (sesuaikan dengan tag plugin)
const TAG_ICON = {
  main:       '🏠',
  downloader: '📥',
  tools:      '🛠️',
  internet:   '🌐',
  ai:         '🤖',
  fun:        '🎮',
  game:       '🎲',
  group:      '👥',
  owner:      '👑',
  sticker:    '🎨',
  anime:      '🌸',
  random:     '🎰',
  nsfw:       '🔞',
  rpg:        '⚔️',
  search:     '🔍',
  maker:      '✏️',
  info:       'ℹ️',
  stalk:      '🕵️',
  quotes:     '💬',
  audio:      '🎵',
  sound:      '🎶',
  voice:      '🔊',
  store:      '🏪',
  panel:      '⚙️',
  quran:      '📿',
  xp:         '📊',
  image:      '🖼️',
  premium:    '💎',
}

// ─── Build kategori dari global.plugins ────────────────────────
function buildCategories() {
  const categories = {}
  const plugins = Object.values(global.plugins || {}).filter(p => !p.disabled)

  for (const p of plugins) {
    const helps = Array.isArray(p.help) ? p.help : [p.help]
    const tags  = Array.isArray(p.tags) ? p.tags : [p.tags]
    for (let tag of tags) {
      if (!tag) continue
      tag = tag.toLowerCase().trim()
      if (!categories[tag]) categories[tag] = []
      categories[tag].push({
        helps,
        limit:   p.limit,
        premium: p.premium,
        owner:   p.owner,
        admin:   p.admin,
        prefix:  !p.customPrefix
      })
    }
  }
  return categories
}

// ─── Handler ──────────────────────────────────────────────────
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  try {
    const THUMB = global.thumb ||
      (fs.existsSync('./media/thumbnail.jpg') ? fs.readFileSync('./media/thumbnail.jpg') : null)

    const botname   = global.namebot  || conn.user?.name || 'Qingxiao Botz'
    const ownerName = global.nameown  || 'RadzApostle'
    const pushname  = m.pushName || 'User'
    const date      = tanggal(Date.now())
    const greeting  = getGreeting()
    const uptime    = runtime(process.uptime())

    const user   = global.db?.data?.users?.[m.sender] || {}
    const limit  = (isOwner || (user.premiumTime >= 1)) ? '∞ Unlimited' : (user.limit ?? '—')
    const role   = isOwner
      ? '👑 *Owner*'
      : (user.premiumTime >= 1) ? '💎 *Premium*'
      : (user.role || '🆓 *User Free*')
    const totalxp = user.totalexp || user.exp || 0

    const categories = buildCategories()
    const arrayMenu  = Object.keys(categories).sort()
    const totalCmd   = Object.values(global.plugins || {})
      .filter(p => !p.disabled)
      .reduce((a, p) => {
        const h = Array.isArray(p.help) ? p.help : [p.help]
        return a + h.filter(Boolean).length
      }, 0)

    const sub = (args[0] || '').toLowerCase().trim()

    // ─── Sub-menu kategori spesifik ───────────────────────────
    if (sub && (categories[sub] || sub === 'all')) {
      const targets = sub === 'all' ? arrayMenu : [sub]
      let lines = []

      for (const tag of targets) {
        if (!categories[tag]) continue
        const icon = TAG_ICON[tag] || '•'

        lines.push(`┌─── ${icon} *${formatTag(tag).toUpperCase()}* ───`)
        for (const item of categories[tag]) {
          for (const cmd of item.helps) {
            if (!cmd) continue
            const pfx  = item.prefix ? usedPrefix : ''
            const base = cmd.split(' ')[0] // ambil nama command saja
            let badge  = ''
            if (item.premium) badge += ' Ⓟ'
            if (item.limit)   badge += ' Ⓛ'
            if (item.owner)   badge += ' Ⓞ'
            if (item.admin)   badge += ' Ⓐ'
            lines.push(`│  *${pfx}${base}*${badge}`)
          }
        }
        lines.push(`└────────────────────\n`)
      }

      lines.push(`_> Ⓟ Premium · Ⓛ Limit · Ⓞ Owner · Ⓐ Admin_`)

      const caption = lines.join('\n').trim()

      // Floating back/nav buttons for sub-menu
      const subNavFlow = [
        { text: '🏠 Main Menu',  id: `${usedPrefix}${command}` },
        { text: '📑 Semua Menu', id: `${usedPrefix}${command} all` },
        { text: '🏓 Ping',       id: `${usedPrefix}ping` }
      ]

      if (THUMB) {
        return conn.sendMessage(m.chat, {
          image: THUMB,
          caption,
          footer: `🌸 ${botname} — ${formatTag(sub)} Menu`,
          nativeFlow: subNavFlow
        }, { quoted: m })
      } else {
        return conn.sendMessage(m.chat, {
          text: caption,
          footer: `🌸 ${botname} — ${formatTag(sub)} Menu`,
          nativeFlow: subNavFlow
        }, { quoted: m })
      }
    }

    // ─── Main menu ────────────────────────────────────────────
    const kategoriList = arrayMenu
      .map(v => `│  ${TAG_ICON[v] || '•'}  ${usedPrefix}menu ${v}`)
      .join('\n')

    const info =
`┌─────────────────────
│  🌸 *${botname}*
│  by *${ownerName}*
├─────────────────────
│  ${greeting}
│  👤  ${pushname}
│  🏷️  ${role}
│  💳  Limit : ${limit}
│  📊  XP    : ${totalxp}
│  ⏱️  Uptime: ${uptime}
│  📅  ${date}
├─────────────────────
│  🗂️  Total Cmd : *${totalCmd}* perintah
│  📁  Kategori  : *${arrayMenu.length}* kategori
├─────────────────────
│  📋 *SEMUA KATEGORI*
│
${kategoriList}
│
│  📑  ${usedPrefix}menu all — tampil semua
├─────────────────────
│  💡 Ketik *${usedPrefix}menu <kategori>*
│     untuk detail perintah
└─────────────────────
  > _${botname} — Ready!_ ✨`.trim()

    // ── nativeFlow: floating buttons + dropdown kategori ─────────────────────
    // Pisah kategori ke beberapa section agar tidak melebihi batas 24 rows
    const CHUNK = 24
    const sections = []
    for (let i = 0; i < arrayMenu.length; i += CHUNK) {
      const slice = arrayMenu.slice(i, i + CHUNK)
      sections.push({
        title: sections.length === 0
          ? `📋 Semua Kategori (${arrayMenu.length})`
          : `📋 Lanjutan Kategori`,
        rows: slice.map(v => ({
          header: '',
          title: `${TAG_ICON[v] || '•'} ${formatTag(v)}`,
          description: `${categories[v]?.reduce((a, p) => a + p.helps.filter(Boolean).length, 0) || 0} perintah`,
          id: `${usedPrefix}${command} ${v}`
        }))
      })
    }

    // Popular quick categories as floating buttons
    const quickCats = ['downloader', 'ai', 'tools', 'game', 'sticker', 'fun']
      .filter(c => arrayMenu.includes(c))
      .slice(0, 3)

    const nativeFlowButtons = [
      // Dropdown list
      {
        text: '☰ Pilih Kategori',
        sections
      },
      // Quick-reply floating buttons
      { text: '📑 Semua Menu', id: `${usedPrefix}${command} all` },
      { text: '🏓 Ping',       id: `${usedPrefix}ping` },
      ...quickCats.map(c => ({
        text: `${TAG_ICON[c] || '•'} ${formatTag(c)}`,
        id: `${usedPrefix}${command} ${c}`
      }))
    ]

    if (THUMB) {
      await conn.sendMessage(m.chat, {
        image: THUMB,
        caption: info,
        footer: `🌸 ${botname} — Ready!`,
        nativeFlow: nativeFlowButtons
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: info,
        footer: `🌸 ${botname} — Ready!`,
        nativeFlow: nativeFlowButtons
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply('✦ Menu error — please try again.')
  }
}

handler.command = /^(menu|help)$/i
handler.tags    = ['main']
handler.help    = ['menu']

export default handler
