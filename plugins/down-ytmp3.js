import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
if (!text)
throw `Masukkan judul atau link YouTube.

Contoh:
.yta never gonna give you up
.yta https://youtu.be/agneRtEe-t8`

const query = text.trim()

let video

if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query)) {
const id = query.match(/(?:v=|youtu\.be\/)([^?&]+)/)?.[1]
if (!id) throw 'URL YouTube tidak valid.'
video = await yts({ videoId: id })
} else {
const res = await yts(query)
video = res.videos[0]
}

if (!video) throw 'Audio tidak ditemukan.'

const dir = './tmp'

if (!fs.existsSync(dir))
fs.mkdirSync(dir, { recursive: true })

const filename = Date.now().toString()
const output = path.join(dir, `${filename}.%(ext)s`)
const cookies = './src/auth/cookies.txt'

await conn.sendMessage(
m.chat,
{
image: { url: video.thumbnail },
caption: `
🎵 YouTube Audio

— · Title : ${video.title}
— · Channel : ${video.author?.name || '-'}
— · Duration : ${video.timestamp}
— · Views : ${(video.views || 0).toLocaleString()}
— · Upload : ${video.ago}
— · Status : Downloading...
`.trim()
},
{ quoted: m }
)

await new Promise((resolve, reject) => {

  const yt = spawn('yt-dlp', [

    '--cookies', cookies,

    '--js-runtimes', 'node',

    '--extractor-args',
    'youtube:player_client=default,-android_sdkless',

    '--ffmpeg-location',
    '/usr/bin',

    '-x',

    '--audio-format',
    'mp3',

    '--audio-quality',
    '192K',

    '--no-playlist',
    '--geo-bypass',
    '--no-cache-dir',
    '--no-warnings',

    '-o',
    output,

    video.url

  ])

  let log = ''

  yt.stdout.on('data', d => log += d.toString())
  yt.stderr.on('data', d => log += d.toString())

  yt.on('error', reject)

  yt.on('close', code => {
    if (code === 0) return resolve()
    reject(new Error(log))
  })

})

const audioFile = fs.readdirSync(dir).find(file =>
  file.startsWith(filename) &&
  file.endsWith('.mp3')
)

if (!audioFile)
  throw 'Audio gagal diunduh.'

const audioPath = path.join(dir, audioFile)

await conn.sendMessage(
  m.chat,
  {
    audio: fs.readFileSync(audioPath),
    mimetype: 'audio/mpeg',
    fileName: `${video.title}.mp3`,
    ptt: false
  },
  { quoted: m }
)

fs.unlinkSync(audioPath)
}

handler.help = ['yta <judul/link>']
handler.tags = ['downloader']
handler.command = /^(yta|ytmp3|ytaudio)$/i
handler.limit = true

export default handler