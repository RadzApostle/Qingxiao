// Follow my channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
import os from 'os'

let handler = async (m, { conn }) => {
  const formatUptime = (sec) => {
    const d = Math.floor(sec / 86400)
    const h = Math.floor((sec % 86400) / 3600)
    const mnt = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)

    if (d) return `${d}d ${h}h`
    if (h) return `${h}h ${mnt}m`
    if (mnt) return `${mnt}m ${s}s`
    return `${s}s`
  }

  const format = b =>
    b >= 1024 ** 3 ? (b / 1024 ** 3).toFixed(2) + ' GB' :
    b >= 1024 ** 2 ? (b / 1024 ** 2).toFixed(2) + ' MB' :
    b >= 1024 ? (b / 1024).toFixed(2) + ' KB' :
    b + ' B'

  const serverUptime = formatUptime(os.uptime())
  const botUptime = formatUptime(process.uptime())

  const total = os.totalmem()
  const free = os.freemem()
  const used = total - free

  const cpu = os.cpus()
  const cpuModel = cpu[0].model.split('@')[0]
  const cpuCore = cpu.length

  const platform = os.platform()
  const arch = os.arch()
  const nodeVer = process.version

  const ping = Math.floor(Math.random() * 60) + 20
  const base = Math.floor(Math.random() * 5000000) + 5000000

  const stats = [
    `server ${serverUptime}`,
    `bot ${botUptime}`,
    `cpu ${cpuCore} core`,
    `ram ${format(used)} / ${format(total)}`,
    `free ${format(free)}`,
    `engine ${cpuModel}`,
    `platform ${platform}`,
    `arch ${arch}`,
    `node ${nodeVer}`
  ]

  await conn.relayMessage(
    m.chat,
    {
      pollResultSnapshotMessage: {
        name: `ping ${ping} ms • ${cpuCore} core • ${format(used)}`,
        pollVotes: stats.map((v, i) => ({
          optionName: v,
          optionVoteCount: base - (i * 400000)
        })),
        pollType: 0,
        contextInfo: {
          stanzaId: m.key.id,
          participant: m.sender,
          remoteJid: m.chat,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: global.chId,
            serverMessageId: 1,
            newsletterName: global.newsletterName
          }
        }
      }
    },
    {}
  )
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^ping$/i

export default handler