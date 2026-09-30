import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  if (!text) throw 'Masukkan judul lagu.\n\nContoh:\n.play dj jedag jedug'

  const res = await yts(text)
  const video = res.videos[0]
  if (!video) throw 'Lagu tidak ditemukan.'

  const dir = './tmp'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const filename = Date.now().toString()
  const output = path.join(dir, `${filename}.%(ext)s`)
  const cookies = './src/auth/cookies.txt'

  if (!fs.existsSync(cookies))
    throw 'Cookies YouTube tidak ditemukan.\n\nPastikan file berada di:\n' + cookies

  await conn.sendMessage(
    m.chat,
    {
      image: { url: video.thumbnail },
      caption: `
遊ぶ YouTube Play ±

 — · *Title* : ${video.title}
 — · *Channel* : ${video.author.name}
 — · *Duration* : ${video.timestamp}
 — · *Views* : ${video.views.toLocaleString()}
 — · *Upload* : ${video.ago}
 — · *Quality* : 128 Kbps
 — · *Status* : Downloading...
`.trim()
    },
    { quoted: m }
  )

  await new Promise((resolve, reject) => {
    const args = [
      '--cookies', cookies,

      '--js-runtimes', 'node',
      '--extractor-args', 'youtube:player_client=default,-android_sdkless',

      '--ffmpeg-location', '/usr/bin',

      '--no-playlist',
      '--no-cache-dir',
      '--geo-bypass',
      '--no-warnings',

      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '128K',

      '-o', output,

      video.url
    ]

    const yt = spawn('yt-dlp', args)

    let log = ''

    yt.stdout.on('data', d => {
      log += d.toString()
    })

    yt.stderr.on('data', d => {
      log += d.toString()
    })

    yt.on('error', reject)

    yt.on('close', code => {
      if (code !== 0) {
        return reject(new Error(log))
      }
      resolve()
    })
  })

  const file = fs.readdirSync(dir).find(
    f => f.startsWith(filename) && f.endsWith('.mp3')
  )

  if (!file) throw 'Audio berhasil diunduh tetapi gagal dikonversi ke MP3.'

  const filePath = path.join(dir, file)

  await conn.sendMessage(
    m.chat,
    {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
      ptt: false
    },
    { quoted: m }
  )

  fs.unlinkSync(filePath)
}

handler.help = ['play <judul>']
handler.tags = ['downloader']
handler.command = /^(play|ytplay)$/i
handler.limit = true

export default handler