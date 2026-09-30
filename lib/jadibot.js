/*
 * lib/jadibot.js
 * Session manager for the "jadibot" feature.
 *
 * Design notes (why it's built this way):
 * - Every sub-bot is created with the SAME makeWASocket() wrapper from
 *   ./simple.js that main.js uses for the primary connection. That wrapper
 *   auto-binds store.js (conn.chats) and defines reply/sendFile/getName/
 *   decodeJid/getJid/etc. Without it, plugins calling m.reply() or conn.getName()
 *   on a jadibot session would throw, because those methods don't exist on a
 *   bare @whiskeysockets/baileys socket.
 * - Every sub-bot is wired to the SAME handler.js used by main.js
 *   (handler.handler / participantsUpdate / groupsUpdate / deleteUpdate).
 *   This means every plugin already installed in /plugins works on a
 *   jadibot session automatically — no separate command table to maintain.
 * - Sessions persist on disk using useMultiFileAuthState, exactly like the
 *   main bot's ./sessions folder, but are split into two roots:
 *
 *       sessions_jadibot/owner_jadibot/<digits-only-number>/
 *       sessions_jadibot/user_jadibot/<digits-only-number>/
 *
 *   The folder a session lands in is decided ONLY by whether the phone
 *   number being paired (`number`, the number that will actually become
 *   the jadibot) is listed in global.owner (config.js). It has nothing to
 *   do with who issued the .jadibot command — see isRegisteredOwnerNumber().
 * - An index of active sessions is mirrored into global.db.data.jadibot so
 *   the bot can attempt to resume sessions after a process restart. The
 *   stored record keeps track of which root (owner/user) the session
 *   belongs to so resume can rebuild the same access level.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as baileys from '@whiskeysockets/baileys'
import pino from 'pino'
import { makeWASocket, smsg } from './simple.js'

const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = baileys

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SESSIONS_ROOT = path.join(__dirname, '..', 'sessions_jadibot')
const OWNER_SESSIONS_ROOT = path.join(SESSIONS_ROOT, 'owner_jadibot')
const USER_SESSIONS_ROOT = path.join(SESSIONS_ROOT, 'user_jadibot')

for (const dir of [SESSIONS_ROOT, OWNER_SESSIONS_ROOT, USER_SESSIONS_ROOT]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

/**
 * The ONLY source of truth for "is this number an owner". Always reads
 * global.owner fresh (config.js hot-reloads this array), never caches it,
 * and never considers who created/started a session — only the number
 * being paired matters.
 */
function isRegisteredOwnerNumber(number) {
    const clean = sanitizeNumber(number)
    if (!clean) return false
    const ownerList = Array.isArray(global.owner) ? global.owner : []
    return ownerList.some(([ownerNumber]) => sanitizeNumber(ownerNumber) === clean)
}

// In-memory registry: ownerJid -> session record
// { number, conn, status, startedAt, retries }
global.jadibotSessions = global.jadibotSessions || new Map()

const MAX_RECONNECT_RETRIES = 5
const MAX_CONCURRENT_SESSIONS = 50

function ensureDbShape() {
    if (!global.db.data.jadibot) global.db.data.jadibot = {}
}

function sanitizeNumber(input) {
    return String(input || '').replace(/[^0-9]/g, '')
}

/**
 * Resolves which root a number's session belongs to, based PURELY on
 * whether that number is a registered owner in config.js. This is the
 * single decision point for owner_jadibot vs user_jadibot placement.
 */
function rootForNumber(number) {
    return isRegisteredOwnerNumber(number) ? OWNER_SESSIONS_ROOT : USER_SESSIONS_ROOT
}

function sessionFolder(number, isOwnerSession) {
    const clean = sanitizeNumber(number)
    const root = typeof isOwnerSession === 'boolean'
        ? (isOwnerSession ? OWNER_SESSIONS_ROOT : USER_SESSIONS_ROOT)
        : rootForNumber(clean)
    return path.join(root, clean)
}

/**
 * Looks for an existing on-disk session for `number` in EITHER root,
 * without assuming which one. Used so things like .delsesijadibot or a
 * resumed boot can find a session even if global.owner changed since the
 * folder was created.
 */
function findExistingSessionFolder(number) {
    const clean = sanitizeNumber(number)
    const ownerPath = path.join(OWNER_SESSIONS_ROOT, clean)
    const userPath = path.join(USER_SESSIONS_ROOT, clean)
    if (fs.existsSync(ownerPath)) return { folder: ownerPath, isOwnerSession: true }
    if (fs.existsSync(userPath)) return { folder: userPath, isOwnerSession: false }
    return null
}

function isCredsValid(folder) {
    try {
        const credsPath = path.join(folder, 'creds.json')
        if (!fs.existsSync(credsPath)) return false
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'))
        return !!(creds && creds.noiseKey && creds.signedIdentityKey)
    } catch {
        return false
    }
}

/**
 * Removes a session folder from disk. Used both when a session logs out
 * and when an owner force-clears a broken/invalid session.
 */
function wipeSessionFolder(number, isOwnerSession) {
    let folder
    if (typeof isOwnerSession === 'boolean') {
        folder = sessionFolder(number, isOwnerSession)
    } else {
        const found = findExistingSessionFolder(number)
        folder = found ? found.folder : sessionFolder(number)
    }
    try {
        if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true })
    } catch (e) {
        console.error('[jadibot] failed to remove session folder', number, e)
    }
}

/**
 * Returns the active session record for a given WhatsApp user (the person
 * who started the jadibot), or null if they have none running.
 */
function getSessionByOwner(ownerJid) {
    return global.jadibotSessions.get(ownerJid) || null
}

/**
 * Prevents a single user from running more than one jadibot session at once.
 */
function hasActiveSession(ownerJid) {
    const session = getSessionByOwner(ownerJid)
    return !!(session && session.status === 'connected')
}

async function stopSession(ownerJid, { wipe = true, reason = 'stopped' } = {}) {
    const session = getSessionByOwner(ownerJid)
    if (!session) return false

    session.status = 'stopping'
    try {
        if (session.conn?.ev) session.conn.ev.removeAllListeners()
    } catch {}
    try {
        await session.conn?.logout?.()
    } catch {}
    try {
        session.conn?.ws?.close?.()
    } catch {}

    global.jadibotSessions.delete(ownerJid)

    ensureDbShape()
    delete global.db.data.jadibot[ownerJid]

    if (wipe) wipeSessionFolder(session.number, session.isOwnerSession)

    console.log(`[jadibot] session for ${ownerJid} (${session.number}) ended: ${reason}`)
    return true
}

/**
 * Starts (or resumes) a jadibot session.
 *
 * @param {object} opts
 * @param {string} opts.ownerJid - JID of the user this session belongs to
 * @param {string} opts.number - phone number (digits only) to pair
 * @param {object} opts.mainConn - the primary bot connection, used to notify the owner
 * @param {string} [opts.notifyChat] - chat to send status updates to (defaults to ownerJid)
 * @param {boolean} [opts.isResume] - true when called during startup session-resume, suppresses some messages
 */
async function startSession({ ownerJid, number, mainConn, notifyChat, isResume = false }) {
    ensureDbShape()
    const targetChat = notifyChat || ownerJid
    const cleanNum = sanitizeNumber(number)

    if (!cleanNum || cleanNum.length < 8) {
        throw new Error('Nomor tidak valid. Sertakan kode negara, contoh: 628123456789')
    }

    if (hasActiveSession(ownerJid)) {
        throw new Error('Kamu sudah memiliki sesi jadibot yang aktif. Hentikan dulu dengan .stopjadibot')
    }

    if (global.jadibotSessions.size >= MAX_CONCURRENT_SESSIONS) {
        throw new Error('Batas maksimum sesi jadibot aktif tercapai. Coba lagi nanti.')
    }

    // ── [ HAK AKSES: TENTUKAN DARI CONFIG.JS, BUKAN PEMBUAT SESSION ] ───
    // isOwnerSession ditentukan HANYA dari apakah `cleanNum` (nomor yang
    // benar-benar akan menjadi jadibot) terdaftar di global.owner pada
    // config.js. `ownerJid` (pengirim command .jadibot) sama sekali tidak
    // dipertimbangkan di sini.
    const isOwnerSession = isRegisteredOwnerNumber(cleanNum)
    const folder = sessionFolder(cleanNum, isOwnerSession)

    // Migrate credentials if this number already has a session saved under
    // the OTHER root (e.g. global.owner changed since it was first paired).
    // This keeps the number's existing WhatsApp login while moving it to
    // the access level config.js says it should have now.
    const existing = findExistingSessionFolder(cleanNum)
    if (existing && existing.folder !== folder && !fs.existsSync(folder)) {
        fs.mkdirSync(path.dirname(folder), { recursive: true })
        fs.renameSync(existing.folder, folder)
        console.log(`[jadibot] memindahkan sesi ${cleanNum} ke ${isOwnerSession ? 'owner_jadibot' : 'user_jadibot'} (sesuai config.js)`)
    }

    fs.mkdirSync(folder, { recursive: true })

    const alreadyRegistered = isCredsValid(folder)
    const { state, saveCreds } = await useMultiFileAuthState(folder)
    const { version } = await fetchLatestBaileysVersion()

    const connectionOptions = {
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(
                state.keys,
                pino().child({ level: 'fatal', stream: 'store' })
            )
        },
        version,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        markOnlineOnConnect: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5
    }

    // Same wrapper main.js uses: brings in store.bind(), reply, sendFile,
    // getName, decodeJid, getJid, etc. so every existing plugin works as-is.
    const conn = makeWASocket(connectionOptions)
    conn.isJadibot = true
    // jadibotOwner = JID of whoever ran .jadibot (used ONLY for session
    // management: who may .stopjadibot / see .statusjadibot for THIS
    // session). It must NEVER be used to grant owner-level command access —
    // that is decided exclusively by isJadibotOwnerSession below, which
    // reflects config.js, not the session creator.
    conn.jadibotOwner = ownerJid
    conn.jadibotNumber = cleanNum
    // isJadibotOwnerSession = true only if `cleanNum` itself is a
    // registered owner number in config.js. This is what handler.js must
    // consult when deciding whether THIS session may run owner commands.
    conn.isJadibotOwnerSession = isOwnerSession
    // Initialize prefix untuk session ini dengan default global.prefix
    // Akan di-restore dari database jika ada custom prefix yang tersimpan
    conn.prefix = global.prefix

    const session = {
        number: cleanNum,
        conn,
        status: 'connecting',
        startedAt: Date.now(),
        retries: 0,
        isOwnerSession
    }
    global.jadibotSessions.set(ownerJid, session)
    global.db.data.jadibot[ownerJid] = { number: cleanNum, startedAt: session.startedAt, isOwnerSession }

    // Use the exact same handler.js the main bot uses, so all plugins work.
    const handlerModule = await import('../handler.js')

    conn.welcome = mainConn?.welcome
    conn.bye = mainConn?.bye
    conn.spromote = mainConn?.spromote
    conn.sdemote = mainConn?.sdemote
    conn.sDesc = mainConn?.sDesc
    conn.sSubject = mainConn?.sSubject

    conn.handler = handlerModule.handler.bind(conn)
    conn.participantsUpdate = handlerModule.participantsUpdate.bind(conn)
    conn.groupsUpdate = handlerModule.groupsUpdate.bind(conn)
    conn.onDelete = handlerModule.deleteUpdate.bind(conn)

    conn.ev.on('creds.update', saveCreds)
    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('group-participants.update', conn.participantsUpdate)
    conn.ev.on('groups.update', conn.groupsUpdate)
    conn.ev.on('message.delete', conn.onDelete)
    conn.ev.on('call', async (calls) => {
        for (const call of calls) {
            const { id, from, status } = call
            const settings = global.db.data.settings[conn.user.jid]
            if (status === 'offer' && settings?.anticall) {
                await conn.rejectCall(id, from)
                console.log(`[jadibot] menolak panggilan dari ${from} (${conn.jadibotNumber})`)
            }
        }
    })

    let pairingRequested = false

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr && !alreadyRegistered && !pairingRequested && !conn.authState.creds.registered) {
            pairingRequested = true
            try {
                await new Promise(r => setTimeout(r, 1500))
                const code = await conn.requestPairingCode(cleanNum)
                const formatted = (typeof code === 'string' ? code : String(code))
                    .match(/.{1,4}/g)?.join('-') || code
                await mainConn.sendMessage(targetChat, {
                    text: `🔗 *Jadibot Pairing Code*\n\nNomor: ${cleanNum}\nKode: *${formatted}*\n\nBuka WhatsApp di HP nomor tersebut → Perangkat Tertaut → Tautkan dengan nomor telepon, lalu masukkan kode di atas. Kode berlaku singkat, segera gunakan.`
                }).catch(() => null)
            } catch (err) {
                pairingRequested = false
                await mainConn.sendMessage(targetChat, {
                    text: `❌ Gagal membuat kode pairing untuk *${cleanNum}*: ${err?.message || err}\n\nCoba ulangi dengan .startjadibot ${cleanNum}`
                }).catch(() => null)
            }
        }

        if (connection === 'open') {
            session.status = 'connected'
            session.retries = 0
            ensureDbShape()
            global.db.data.jadibot[ownerJid] = {
                number: cleanNum,
                startedAt: session.startedAt,
                connectedAt: Date.now(),
                isOwnerSession
            }
            // Restore prefix dari database untuk session Jadibot ini
            const savedPrefix = global.db?.data?.settings?.[conn.user?.jid]?.prefix
            if (savedPrefix) conn.prefix = savedPrefix
            if (!isResume) {
                await mainConn.sendMessage(targetChat, {
                    text: `✅ Jadibot untuk *${cleanNum}* berhasil terhubung!\n\nBot ini sekarang aktif menggunakan nomor tersebut dan merespons perintah yang sama seperti bot utama. Gunakan *.stopjadibot* untuk menghentikannya kapan saja.`
                }).catch(() => null)
            }
        }

        if (connection === 'close') {
            session.status = 'disconnected'
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const loggedOut = statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.badSession

            if (loggedOut) {
                await stopSession(ownerJid, { wipe: true, reason: 'logged out' })
                await mainConn.sendMessage(targetChat, {
                    text: `⚠️ Sesi jadibot *${cleanNum}* keluar (logged out) dan datanya telah dihapus. Jalankan ulang .startjadibot jika ingin menyambungkan lagi.`
                }).catch(() => null)
                return
            }

            session.retries += 1
            if (session.retries > MAX_RECONNECT_RETRIES) {
                await stopSession(ownerJid, { wipe: false, reason: 'max retries exceeded' })
                await mainConn.sendMessage(targetChat, {
                    text: `❌ Jadibot *${cleanNum}* gagal terhubung kembali setelah beberapa percobaan. Sesi dihentikan sementara (data login tidak dihapus). Coba .startjadibot ${cleanNum} untuk mencoba lagi.`
                }).catch(() => null)
                return
            }

            console.log(`[jadibot] reconnecting ${cleanNum} (attempt ${session.retries})`)
            setTimeout(() => {
                startSession({ ownerJid, number: cleanNum, mainConn, notifyChat: targetChat, isResume: true })
                    .catch(e => console.error('[jadibot] reconnect failed', e))
            }, 5000)
        }
    })

    return session
}

/**
 * Attempts to resume any sessions that were active before the process
 * restarted. Called once from main.js after the primary connection is up.
 * Sessions whose credentials are missing/invalid are skipped and cleaned up.
 */
async function resumeSessions(mainConn) {
    ensureDbShape()
    const entries = Object.entries(global.db.data.jadibot || {})
    for (const [ownerJid, info] of entries) {
        const found = findExistingSessionFolder(info.number)
        if (!found || !isCredsValid(found.folder)) {
            delete global.db.data.jadibot[ownerJid]
            continue
        }
        try {
            // Re-evaluate against config.js on every resume — if global.owner
            // changed since the session was created, the session's access
            // level changes too (it's never derived from who created it).
            await startSession({ ownerJid, number: info.number, mainConn, isResume: true })
        } catch (e) {
            console.error('[jadibot] failed to resume session for', ownerJid, e)
            delete global.db.data.jadibot[ownerJid]
        }
    }
}

function listActiveSessions() {
    return [...global.jadibotSessions.entries()].map(([ownerJid, session]) => ({
        ownerJid,
        number: session.number,
        status: session.status,
        startedAt: session.startedAt,
        connected: session.status === 'connected',
        botJid: session.conn?.user?.id || null,
        isOwnerSession: !!session.isOwnerSession
    }))
}

export {
    startSession,
    stopSession,
    resumeSessions,
    listActiveSessions,
    getSessionByOwner,
    hasActiveSession,
    sanitizeNumber,
    wipeSessionFolder,
    isCredsValid,
    sessionFolder,
    findExistingSessionFolder,
    isRegisteredOwnerNumber,
    rootForNumber,
    SESSIONS_ROOT,
    OWNER_SESSIONS_ROOT,
    USER_SESSIONS_ROOT
}
