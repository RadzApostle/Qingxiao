
/*
📌 Nama Fitur: Cpanel 
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/

import axios from 'axios';

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import '../config.js';

const handler = async (m, { conn }) => {
  const domain = global.domain;
  const apikey = global.apikey;

  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    });

    const res = await response.json();
    const users = res.data;

    if (!users || users.length === 0) return m.reply("Tidak ada admin panel.");

    let teks = "*Daftar Admin Panel:*\n";

    for (const i of users) {
      if (i.attributes.root_admin !== true) continue;
      teks += `
📡 *${i.attributes.id} [ ${i.attributes.first_name} ]*
• Nama: ${i.attributes.first_name}
• Created: ${i.attributes.created_at.split("T")[0]}
`;
    }

    if (teks.trim() === "*Daftar Admin Panel:*") return m.reply("Tidak ditemukan admin panel.");

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m });
  } catch (err) {
    m.reply("Gagal mengambil data admin panel:\n" + err.message);
  }
};

handler.command = /^listadmin$/i;
handler.tags = ['panel'];
handler.help = ['listadmin'];
handler.owner = false
handler.premium = true


export default handler;