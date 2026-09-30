// ============================================================
// main.js — Qingxiao Botz WhatsApp Bot (Deobfuscated)
// Original: JavaScript Obfuscator (RC4 + Base64 + String Array)
// Cleaned : 2026-07-20
// ============================================================

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'
import path, { join } from 'path'
import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { format } from 'util'
import { spawn } from 'child_process'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import _ from 'lodash'
import syntaxError from 'syntax-error'
import chalk from 'chalk'
import readline from 'readline'
import pino from 'pino'
import ws from 'ws'
import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { Low, JSONFile } from 'lowdb'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import cloudDBAdapter from './lib/cloudDBAdapter.js'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import {
  sanitizePhoneNumber,
  isValidPhoneNumber,
  showLoginMenu,
  askPhoneNumber,
  generatePairingCode
} from './lib/pairing.js'

// ── Global helpers (ESM shim) ─────────────────────────────────
global.__filename = function filename(url = import.meta.url, isWindows = platform !== 'win32') {
  return isWindows
    ? /file:\/\/\//.test(url) ? fileURLToPath(url) : url
    : pathToFileURL(url).toString()
}

global.__dirname = function dirname(filePath) {
  return path.dirname(global.__filename(filePath, true))
}

global.__require = function require(url = import.meta.url) {
  return createRequire(url)
}

// ── Bootstrap ─────────────────────────────────────────────────
protoType()
serialize()

const { CONNECTING } = ws
const { chain } = _

const argv = yargs(hideBin(process.argv)).exitProcess(false).parse()
const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(argv)

// Auto-follow channels on startup
global.autoFollowChannels = [
  '120363420257820859@newsletter'
]

// Command prefix regex
global.prefix = new RegExp(
  '^[' +
  (opts.prefix || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-^]/g, '\\$&') +
  ']'
)

// ── Database ──────────────────────────────────────────────────
global.db = new Low(
  /https?:\/\//.test(opts.db || '')
    ? new cloudDBAdapter(opts.db)
    : /mongodb(\+srv)?:\/\//i.test(opts.db)
      ? opts.mongodbv2
        ? new mongoDBV2(opts.db)
        : new mongoDB(opts.db)
      : new JSONFile((opts._[0] ? opts._[0] + '_' : '') + 'database.json')
)

global.DATABASE = global.db

// ── db.save() alias — lowdb uses write(), not save() ─────────
// Some plugins call global.db.save(); this prevents TypeError.
global.db.save = function () {
  return global.db.write().catch(console.error)
}

global.loadDatabase = async function loadDatabase() {
  if (db.READ) {
    return new Promise(resolve =>
      setInterval(async function () {
        if (!db.READ) {
          clearInterval(this)
          resolve(db.data == null ? global.loadDatabase() : db.data)
        }
      }, 1000)
    )
  }
  if (db.data !== null) return
  db.READ = true
  await db.read().catch(console.error)
  db.READ = null

  // Merge existing data with required structure — never overwrite saved data
  const existing = db.data || {}
  db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    menfess: {},
    jadibot: {},
    settings: {},
    cmd: {},
    game: {},
    sewa: {},
    premium: {},
    anonymous: {},
    sessions: {},
    ...existing,
    // Ensure top-level keys are always objects even if existing had wrong type
    users:     (typeof existing.users     === 'object' && existing.users)     ? existing.users     : {},
    chats:     (typeof existing.chats     === 'object' && existing.chats)     ? existing.chats     : {},
    stats:     (typeof existing.stats     === 'object' && existing.stats)     ? existing.stats     : {},
    sticker:   (typeof existing.sticker   === 'object' && existing.sticker)   ? existing.sticker   : {},
    settings:  (typeof existing.settings  === 'object' && existing.settings)  ? existing.settings  : {},
    cmd:       (typeof existing.cmd       === 'object' && existing.cmd)       ? existing.cmd       : {},
    sessions:  (typeof existing.sessions  === 'object' && existing.sessions)  ? existing.sessions  : {},
  }
  global.db.chain = chain(db.data)
  console.log('[DB] Database loaded ✅')
  console.log(`[DB] Users: ${Object.keys(db.data.users).length}, Chats: ${Object.keys(db.data.chats).length}`)
}

/**
 * Ensure a user entry exists in the database.
 * Plugins should call this before accessing db.data.users[jid].
 * @param {string} jid  Full JID — must end with @s.whatsapp.net
 * @param {object} [extra]  Extra fields to merge into a new entry
 */
global.autoCreateUser = function autoCreateUser(jid, extra = {}) {
  if (typeof global.db.data.users[jid] !== 'object' || global.db.data.users[jid] === null) {
    global.db.data.users[jid] = {
      registered: false, name: '', nama: '', age: -1, regTime: -1,
      level: 0, exp: 0, totalexp: 0, limit: 100, freelimit: 0,
      warn: 0, warned: 0, afk: -1, afkReason: '',
      banned: false, banReason: '', role: 'Free user',
      premium: false, premiumTime: 0, money: 0, bank: 0,
      ...extra
    }
    console.log(`[DB] User auto-created: ${jid}`)
  }
  return global.db.data.users[jid]
}

loadDatabase()

// ── Readline interface ────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
var question = (prompt) => new Promise(resolve => rl.question(prompt, resolve))

// ── API helper ────────────────────────────────────────────────
global.API = (name, path = '/', query = {}, apiKey) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apiKey
    ? '?' + new URLSearchParams(Object.entries({
        ...query,
        ...(apiKey ? { [apiKey]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {})
      }))
    : '')

global.timestamp = { start: new Date() }

// ── Baileys connection ────────────────────────────────────────
const { version, isLatest } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState('./sessions')

const store = {
  messages: {},
  loadMessage: async (jid, id) => store.messages?.[jid]?.[id] || null,
  bind: (ev) => {
    ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        const jid = msg.key.remoteJid
        if (!store.messages[jid]) store.messages[jid] = {}
        store.messages[jid][msg.key.id] = msg
      }
    })
  }
}

// ── Tentukan metode pairing sebelum membuat socket ────────────
// Variabel ini akan digunakan di connectionOptions (printQRInTerminal)
let selectedMethod = 'pairing'      // default: pairing code
let selectedPhoneNumber = ''        // nomor yang akan digunakan

if (!state.creds.registered) {
  if (global.pairingMethod === true) {
    // Tampilkan menu interaktif dan tunggu pilihan user
    selectedMethod = await showLoginMenu()

    if (selectedMethod === 'pairing') {
      // Minta nomor telepon dari user
      selectedPhoneNumber = await askPhoneNumber()
    }
    // Jika QR, tidak perlu nomor — printQRInTerminal akan di-set true
  } else {
    // pairingMethod = false → langsung pairing code, ambil nomor dari config
    selectedMethod = 'pairing'
    const rawNumber = global.pairingNumber || global.pairing || ''
    const cleaned = sanitizePhoneNumber(rawNumber)

    if (!isValidPhoneNumber(cleaned)) {
      console.log(chalk.red.bold('\n [ ERROR ] global.pairingNumber tidak valid di config.js!'))
      console.log(chalk.yellow(' Tambahkan nomor yang valid, contoh: global.pairingNumber = "628xxxxxxxx"'))
      console.log(chalk.yellow(' Format nomor harus menyertakan kode negara (tanpa + atau spasi)\n'))
      process.exit(1)
    }

    selectedPhoneNumber = cleaned
    console.log(chalk.bgCyan(chalk.black(` [ INFO ] Mode auto — Pairing Code untuk: +${selectedPhoneNumber} `)))
  }
}

const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  // QR hanya ditampilkan jika user memilih metode QR dan belum terdaftar
  printQRInTerminal: selectedMethod === 'qr',
  browser: ['Ubuntu', 'Edge', '20.0.0'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' }))
  },
  getMessage: async (key) => {
    const msg = await store.loadMessage(key.remoteJid, key.id)
    return msg?.message || undefined
  },
  generateHighQualityLinkPreview: true,
  patchMessageBeforeSending: (msg) => {
    const isViewOnce = !!(msg.buttonsMessage || msg.templateMessage || msg.listMessage)
    if (isViewOnce) {
      msg = {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} },
            ...msg
          }
        }
      }
    }
    return msg
  },
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 0,
  syncFullHistory: false,
  markOnlineOnConnect: true,
  keepAliveIntervalMs: 10000,
  shouldIgnoreJid: (jid) => typeof jid === 'string' && jid === 'status@broadcast',
  transactionOpts: { maxCommitRetries: 3, delayBetweenTriesMs: 100 },
  appStateMacVerification: { patch: true, snapshot: true }
}

global.conn = makeWASocket(connectionOptions)
store.bind(global.conn.ev)
conn.isInit = false

// ── Pairing code (dieksekusi setelah socket siap) ─────────────
if (!conn.authState.creds.registered && selectedMethod === 'pairing') {
  // Tunggu sebentar agar socket stabil, lalu generate pairing code
  setTimeout(() => generatePairingCode(global.conn, selectedPhoneNumber), 3500)
}

// ── Auto Reset Limit ──────────────────────────────────────────
async function resetLimit() {
  try {
    let users = Object.entries(global.db.data.users)
    const defaultLimit = 25
    users.map(([jid, user]) => {
      if (user.limit <= defaultLimit) user.limit = defaultLimit
    })
    console.log('Success Auto Reset Limit')
  } finally {
    setInterval(() => resetLimit(), 86400000) // 1 day
  }
}

// ── Server & periodic tasks ───────────────────────────────────
if (!opts.test) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error)
    clearTmp()
  }, 60 * 1000)
}

function clearTmp() {
  const dirs = [tmpdir(), join(__dirname, './tmp')]
  dirs.forEach(dir => { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }) })
  const files = []
  dirs.forEach(dir => readdirSync(dir).forEach(file => files.push(join(dir, file))))
  files.map(file => {
    const stat = statSync(file)
    if (stat.isFile() && Date.now() - stat.mtimeMs >= 1000 * 60 * 3) return unlinkSync(file)
    return false
  })
}

async function clearSessions(folder = './sessions') {
  try {
    const sessionFiles = readdirSync(folder)
    const result = await Promise.all(sessionFiles.map(async (file) => {
      try {
        const filePath = path.join(folder, file)
        const stat = statSync(filePath)
        if (stat.isFile() && file !== 'creds.json') {
          unlinkSync(filePath)
          console.log('Deleted session:', filePath)
          return filePath
        }
      } catch (e) {
        console.error('Error processing ' + file + ': ' + e.message)
      }
    }))
    return result.filter(f => f !== null)
  } catch (e) {
    console.error('Error in Clear Sessions: ' + e.message)
    return []
  } finally {
    setTimeout(() => clearSessions(folder), 3600000) // 1 hour
  }
}

// ── Connection update handler ─────────────────────────────────
async function connectionUpdate(update) {
  const { receivedPendingNotifications, connection, lastDisconnect, isOnline, isNewLogin } = update

  if (isNewLogin) conn.isInit = true

  if (connection === 'connecting') {
    console.log(chalk.redBright('⚡ Mengaktifkan Bot, Mohon tunggu sebentar...'))
  } else if (connection === 'open') {
    console.log(chalk.green('✅ Tersambung'))
    conn.isInit = false
    for (const channelId of global.autoFollowChannels || []) {
      try { await conn.newsletterFollow(channelId) } catch {}
    }
  }

  if (isOnline === true) console.log(chalk.green('Status Aktif'))
  else if (isOnline === false) console.log(chalk.red('Status Mati'))

  if (receivedPendingNotifications) console.log(chalk.yellow('Menunggu Pesan Baru'))

  if (connection === 'close') {
    console.log(chalk.red('⏱️ Koneksi terputus & mencoba menyambung ulang...'))
    if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      console.log(await global.reloadHandler(true))
    }
  }

  global.timestamp.connect = new Date()
  if (global.db.data == null) await global.loadDatabase()
}

process.on('uncaughtException', console.error)

// ── Handler & plugin loader ───────────────────────────────────
let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async function (restart) {
  try {
    const newHandler = await import('./handler.js?update=' + Date.now()).catch(console.error)
    if (Object.keys(newHandler || {}).length) handler = newHandler
  } catch (e) {
    console.error(e)
  }

  if (restart) {
    const prevChats = global.conn.chats
    try { global.conn.ws.close() } catch {}
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions)
    store.bind(global.conn.ev)
    isInit = true
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('group-participants.update', conn.participantsUpdate)
    conn.ev.off('groups.update', conn.groupsUpdate)
    conn.ev.off('message.delete', conn.onDelete)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
    conn.ev.off('call', conn.callHandler)
  }

  conn.handler            = handler.handler.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
  conn.groupsUpdate       = handler.groupsUpdate.bind(global.conn)
  conn.onDelete           = handler.deleteUpdate.bind(global.conn)
  conn.connectionUpdate   = connectionUpdate.bind(global.conn)
  conn.credsUpdate        = saveCreds.bind(global.conn)

  conn.callHandler = async (calls) => {
    for (const call of calls) {
      if (call.status !== 'ringing') continue
      const settings = global.db.data.settings?.[conn.user.jid]
      if (!settings?.anticall) continue
      await conn.rejectCall(call.id, call.from).catch(() => {})
    }
  }

  conn.ev.on('messages.upsert',          conn.handler)
  conn.ev.on('group-participants.update', conn.participantsUpdate)
  conn.ev.on('groups.update',            conn.groupsUpdate)
  conn.ev.on('message.delete',           conn.onDelete)
  conn.ev.on('connection.update',        conn.connectionUpdate)
  conn.ev.on('creds.update',             conn.credsUpdate)
  conn.ev.on('call',                     conn.callHandler)

  isInit = false
  return true
}

// ── Plugin folder watcher ─────────────────────────────────────
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (file) => /\.js$/.test(file)

global.plugins = {}

async function filesInit() {
  for (let file of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      let filePath = global.__filename(join(pluginFolder, file))
      const mod = await import(filePath)
      global.plugins[file] = mod.default || mod
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[file]
    }
  }
}

filesInit()
  .then(() => console.log(chalk.green('✅ Loaded ' + Object.keys(global.plugins).length + ' plugins')))
  .catch(console.error)

global.reload = async (event, file) => {
  if (pluginFilter(file)) {
    let filePath = global.__filename(join(pluginFolder, file), true)

    if (file in global.plugins) {
      if (existsSync(filePath)) conn.logger.info("re - require plugin '" + file + "'")
      else {
        conn.logger.warn("deleted plugin '" + file + "'")
        return delete global.plugins[file]
      }
    } else {
      conn.logger.info("requiring new plugin '" + file + "'")
    }

    const syntaxErr = syntaxError(readFileSync(filePath), file, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true
    })

    if (syntaxErr) {
      conn.logger.error("syntax error while loading '" + file + "'\n" + format(syntaxErr))
    } else {
      try {
        const mod = await import(global.__filename(filePath) + '?update=' + Date.now())
        global.plugins[file] = mod.default || mod
      } catch (e) {
        conn.logger.error("error require plugin '" + file + "\n" + format(e) + "'")
      } finally {
        global.plugins = Object.fromEntries(
          Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        )
      }
    }
  }
}

Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

// ── Quick system tool check ───────────────────────────────────
async function _quickTest() {
  let results = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map(proc => {
    return Promise.race([
      new Promise(resolve => {
        proc.on('close', (code) => { resolve(code !== 127) })
      }),
      new Promise(resolve => {
        proc.on('error', () => resolve(false))
      })
    ])
  }))

  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = results
  console.log(results)

  let support = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
  Object.freeze(global.support)

  if (!support.ffmpeg) conn.logger.warn('Silahkan install ffmpeg terlebih dahulu agar bisa mengirim video')
  if (support.ffmpeg && !support.ffmpegWebp) conn.logger.warn('Sticker Mungkin Tidak Beranimasi tanpa libwebp di ffmpeg (--enable-libwebp while compiling ffmpeg)')
  if (!support.convert && !support.magick && !support.gm) conn.logger.warn('Fitur Stiker Mungkin Tidak Bekerja Tanpa imagemagick dan libwebp di ffmpeg belum terinstall (pkg install imagemagick)')
}

_quickTest()
  .then(() => conn.logger.info('☑️ Quick Test Done , nama file session ~> creds.json'))
  .catch(console.error)
