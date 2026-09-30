
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

const handler = async (m, { conn, sock, text, command }) => {
  const capital = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  if (!text) return m.reply(`Contoh penggunaan: *${command} <id server>*`)

  let sections
  let nameSrv
  try {
    let f = await fetch(`${global.domain}/api/application/servers`, {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + global.apikey
      }
    })
    let result = await f.json()
    let servers = result.data

    for (let server of servers) {
      let s = server.attributes
      if (Number(text) === s.id) {
        sections = s.name.toLowerCase()
        nameSrv = s.name

        let deleteServer = await fetch(`${global.domain}/api/application/servers/${s.id}`, {
          method: 'DELETE',
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + global.apikey
          }
        })

        let res = deleteServer.ok ? { errors: null } : await deleteServer.json()
        if (!res.errors) {
          let cek = await fetch(`${global.domain}/api/application/users`, {
            method: 'GET',
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": "Bearer " + global.apikey
            }
          })
          let res2 = await cek.json();
          let users = res2.data;
          for (let user of users) {
            let u = user.attributes
            if (u.first_name.toLowerCase() === sections) {
              let delusr = await fetch(`${global.domain}/api/application/users/${u.id}`, {
                method: 'DELETE',
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + global.apikey
                }
              })
              let res = delusr.ok ? { errors: null } : await delusr.json()
            }
          }

          return await m.reply(`Sukses menghapus server panel *${capital(nameSrv)}*`)
        }
      }
    }

    return m.reply("Gagal menghapus server! ID server tidak ditemukan.")
  } catch (err) {
    return m.reply("Terjadi kesalahan: " + err.message)
  }
}

handler.command = /^delpanel$/i
handler.tags = ['panel']
handler.help = ['delpanel']
handler.owner = true

export default handler