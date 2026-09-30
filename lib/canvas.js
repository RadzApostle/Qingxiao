// lib/canvas.js — migrated from canvas to sharp
import sharp from 'sharp'
import axios from 'axios'

async function fetchBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
  return Buffer.from(res.data)
}

class LevelUp {
  constructor() {
    this.bg = 'https://i.ibb.co/4JcZQ6F/20210807-112304.jpg'
    this.avatar = 'https://i.ibb.co/G5mJZxs/rin.jpg'
  }

  setAvatar(value) {
    this.avatar = value
    return this
  }

  async toAttachment() {
    const W = 600, H = 200

    const [bgBuf, avBuf] = await Promise.all([
      fetchBuffer(this.bg),
      fetchBuffer(this.avatar)
    ])

    // Resize background
    const bg = await sharp(bgBuf).resize(W, H).toBuffer()

    // Round-clip avatar (80x80)
    const AV = 80
    const mask = Buffer.from(
      `<svg><circle cx="${AV / 2}" cy="${AV / 2}" r="${AV / 2}" fill="white"/></svg>`
    )
    const av = await sharp(avBuf)
      .resize(AV, AV)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer()

    // Compose: place avatar at (25, 60)
    const result = await sharp(bg)
      .composite([{ input: av, left: 25, top: 60 }])
      .toBuffer()

    return result
  }
}

export default LevelUp
