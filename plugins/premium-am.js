import crypto from 'node:crypto'

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const BASE = 'https://alight-motion-premium.site.je'

function toNumbers(d) {
  const e = []
  d.replace(/(..)/g, function (d) {
    e.push(parseInt(d, 16))
  })
  return e
}

function toHex() {
  const d = arguments.length === 1 && arguments[0].constructor === Array
    ? arguments[0]
    : arguments

  let e = ''

  for (let f = 0; f < d.length; f++) {
    e += (16 > d[f] ? '0' : '') + d[f].toString(16)
  }

  return e.toLowerCase()
}

function decryptAES(encryptedHex, keyHex, ivHex) {
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const key = Buffer.from(keyHex, 'hex')
  const iv = Buffer.from(ivHex, 'hex')

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  decipher.setAutoPadding(false)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])

  return Array.from(decrypted)
}

async function getCookie() {
  const res = await fetch(BASE + '/', {
    headers: {
      'User-Agent': UA
    }
  })

  const html = await res.text()

  const aMatch = html.match(/a=toNumbers\("([^"]+)"\)/)
  const bMatch = html.match(/b=toNumbers\("([^"]+)"\)/)
  const cMatch = html.match(/c=toNumbers\("([^"]+)"\)/)

  if (!aMatch || !bMatch || !cMatch) {
    throw new Error('extract AES params failed')
  }

  const a = toNumbers(aMatch[1])
  const b = toNumbers(bMatch[1])
  const c = toNumbers(cMatch[1])

  const decrypted = decryptAES(
    Buffer.from(c).toString('hex'),
    Buffer.from(a).toString('hex'),
    Buffer.from(b).toString('hex')
  )

  return toHex(decrypted)
}

async function fetchAPI(path, cookie, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'User-Agent': UA,
      Cookie: `__test=${cookie}`
    }
  }

  if (body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(BASE + path, opts)
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const [email, link] = text.split('|').map(v => v ? v.trim() : '')

  if (!email) {
    return m.reply(
      `Format atau cara pakai salah!\n\n` +
      `📌 *Logika Penggunaan:*\n` +
      `1. Masukkan email saja untuk meminta/mengirim Magic Link.\n` +
      `2. Masukkan email dan link verifikasi dengan pemisah tanda pipa (|) jika link sudah diterima.\n\n` +
      `📝 *Contoh 1 (Kirim Email):*\n` +
      `${usedPrefix}${command} emailkamu@gmail.com\n\n` +
      `📝 *Contoh 2 (Verifikasi Link):*\n` +
      `${usedPrefix}${command} emailkamu@gmail.com | https://alight-motion-premium.site.je/verify?token=xxx`
    )
  }

  try {
    const cookie = await getCookie()

    if (!link) {
      await m.reply('Mengirim magic link ke email...')

      const sendRes = await fetchAPI(
        '/index.php?action=send_eceran',
        cookie,
        'POST',
        { email }
      )

      const resultText = typeof sendRes === 'string' ? sendRes : JSON.stringify(sendRes, null, 2)
      return m.reply(`Berhasil mengirim email!\n\nResponse:\n${resultText}`)
    } else {
      await m.reply('Memverifikasi magic link...')

      const verifyRes = await fetchAPI(
        '/index.php?action=verify_eceran',
        cookie,
        'POST',
        {
          email,
          link
        }
      )

      const resultText = typeof verifyRes === 'string' ? verifyRes : JSON.stringify(verifyRes, null, 2)
      return m.reply(`Verifikasi selesai!\n\nResponse:\n${resultText}`)
    }
  } catch (err) {
    return m.reply(`Terjadi kesalahan: ${err.message}`)
  }
}

handler.help = ['alightmotion <email> [| link]']
handler.tags = ['tools', 'premium']
handler.command = /^(alightmotion|am)$/i

export default handler