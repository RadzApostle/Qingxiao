import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
if (!text)
throw `Masukkan judul atau link YouTube.

Contoh:
.ytv never gonna give you up
.ytv never gonna give you up 720
.ytv https://youtu.be/agneRtEe-t8 1080`

const argsText = text.trim().split(/\s+/)

let quality = '720'

const last = argsText.at(-1)

if (/^\d{3,4}$/.test(last)) {
quality = last
argsText.pop()
}

const query = argsText.join(' ')

let video

if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query)) {
const id = query.match(/(?:v=|youtu\.be\/)([^?&]+)/)?.[1]
if (!id) throw 'URL YouTube tidak valid.'
video = await yts({ videoId: id })
} else {
const res = await yts(query)
video = res.videos[0]
}

if (!video) throw 'Video tidak ditemukan.'

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
🎥 YouTube Video

— · Title : ${video.title}
— · Channel : ${video.author?.name || '-'}
— · Duration : ${video.timestamp}
— · Views : ${(video.views || 0).toLocaleString()}
— · Upload : ${video.ago}
— · Quality : ${quality}p
— · Status : Downloading...
`.trim()
},
{ quoted: m }
)

await new Promise((resolve, reject) => {

  const format =
    `bestvideo[vcodec*=avc1][height<=${quality}]+bestaudio[ext=m4a]/` +
    `bestvideo[height<=${quality}]+bestaudio/` +
    `best[height<=${quality}]`

  const yt = spawn('yt-dlp', [

    '--cookies', cookies,

    '--js-runtimes', 'node',

    '--extractor-args',
    'youtube:player_client=default,-android_sdkless',

    '--ffmpeg-location',
    '/usr/bin',

    '--merge-output-format',
    'mp4',

    '--no-playlist',
    '--geo-bypass',
    '--no-cache-dir',
    '--no-warnings',

    '-f',
    format,

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

const rawFile = fs.readdirSync(dir).find(file =>
  file.startsWith(filename) &&
  (file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.webm'))
)

if (!rawFile)
  throw 'Video gagal diunduh.'

const rawPath = path.join(dir, rawFile)
const finalPath = path.join(dir, `${filename}_wa.mp4`)

await new Promise((resolve, reject) => {

  const ff = spawn('/usr/bin/ffmpeg', [

    '-y',

    '-i', rawPath,

    '-c:v', 'libx264',

    '-preset', 'veryfast',

    '-crf', '24',

    '-pix_fmt', 'yuv420p',

    '-movflags', '+faststart',

    '-c:a', 'aac',

    '-b:a', '',

    finalPath

  ])

  let log = ''

  ff.stdout.on('data', d => log += d.toString())
  ff.stderr.on('data', d => log += d.toString())

  ff.on('error', reject)

  ff.on('close', code => {
    if (code === 0) return resolve()
    reject(new Error(log))
  })

})

await conn.sendMessage(
  m.chat,
  {
    video: fs.readFileSync(finalPath),
    mimetype: 'video/mp4',
    fileName: `${video.title}.mp4`,
    caption: `🎬 ${video.title}`
  },
  { quoted: m }
)

fs.unlinkSync(rawPath)
fs.unlinkSync(finalPath)
}

handler.help = ['ytv <judul/link> [720|1080]']
handler.tags = ['downloader']
handler.command = /^(ytv|ytmp4|ytvideo)$/i
handler.limit = true

export default handler