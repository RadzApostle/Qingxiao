
/*
📌 Nama Fitur: Cpanel 
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/

import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import '../config.js'

const handler = async (m, { conn, text, args, command }) => {
  if (!text) return m.reply(`Contoh:\n\n*${command} <id_user_admin>*`)

  const { domain, apikey } = global

  try {
    const cek = await fetch(`${domain}/api/application/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    })

    const res = await cek.json()
    const users = res.data

    let target = users.find(e => e.attributes.id == args[0] && e.attributes.root_admin)

    if (!target) return m.reply("Gagal menghapus akun!\nID user tidak ditemukan atau bukan admin.")

    const idadmin = target.attributes.id
    const username = target.attributes.username

    const delusr = await fetch(`${domain}/api/application/users/${idadmin}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    })

    if (!delusr.ok) {
      const err = await delusr.json()
      return m.reply("Gagal menghapus:\n" + JSON.stringify(err.errors?.[0] || err, null, 2))
    }

    await m.reply(`Sukses menghapus akun admin panel *${username}* ✅`)
  } catch (err) {
    m.reply("Terjadi kesalahan: " + err.message)
  }
}

handler.command = ['deladmin']
handler.tags = ['panel']
handler.help = ['deladmin <id_user_admin>']
handler.owner = true

export default handler