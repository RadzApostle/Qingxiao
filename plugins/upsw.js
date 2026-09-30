import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!mime) return m.reply("Reply media (gambar/video/audio) yang mau dijadikan SW!")

  const media = await q.download()
  const getGroups = await conn.groupFetchAllParticipating()
  const groups = Object.values(getGroups)
  let allParticipants = []

  for (let group of groups) {
    let members = group.participants.map(p => p.id)
    allParticipants.push(...members)
  }

  const uniqueParticipants = [...new Set(allParticipants)]
  const mediaType = mime.split('/')[0]

  let payload = {}
  let tempRawPath = ''
  let tempOpusPath = ''

  if (mediaType === 'audio' || mime.includes('opus') || mime.includes('ogg') || mime.includes('mpeg')) {
    const dir = './tmp'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const filename = Date.now().toString()
    tempRawPath = path.join(dir, `${filename}_raw`)
    tempOpusPath = path.join(dir, `${filename}.opus`)

    fs.writeFileSync(tempRawPath, media)

    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y',
        '-i', tempRawPath,
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '64k',
        '-vbr', 'on',
        '-application', 'voip',
        tempOpusPath
      ])

      let log = ''
      ff.stderr.on('data', d => log += d.toString())
      ff.on('error', reject)
      ff.on('close', code => {
        if (code === 0) return resolve()
        reject(new Error(log))
      })
    })

    // Payload khusus VN/Audio untuk status
    payload = {
      audio: fs.readFileSync(tempOpusPath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }
  } else {
    payload = {
      [mediaType]: media,
      caption: text || q.text || q.caption || ''
    }
  }

  await conn.sendMessage(
    'status@broadcast',
    payload,
    {
      broadcast: true,
      statusJidList: uniqueParticipants
    }
  )

  try {
    if (tempRawPath && fs.existsSync(tempRawPath)) fs.unlinkSync(tempRawPath)
    if (tempOpusPath && fs.existsSync(tempOpusPath)) fs.unlinkSync(tempOpusPath)
  } catch (e) {
    console.error("Gagal menghapus file temp:", e)
  }

  m.reply(`Sukses up SW ke ${groups.length} grup (${uniqueParticipants.length} member)`)
}

handler.help = ['upsw <reply media/audio>']
handler.tags = ['owner']
handler.command = /^(upsw|sw)$/i
handler.owner = true

export default handler