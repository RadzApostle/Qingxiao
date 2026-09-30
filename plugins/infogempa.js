/*
📌 Nama Fitur: Info Gempa
🏷️ Type : Plugin ESM
🔗 Sumber :  https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N
🔗 Api : https://api.siputzx.my.id/api/info/bmkg
✍️ Convert By ZenzXD
*/

import axios from 'axios';

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = async (m, { conn }) => {
  let res = await fetch('https://api.siputzx.my.id/api/info/bmkg');
  if (!res.ok) throw 'Gagal mengambil data dari API.';
  
  let json = await res.json();
  if (!json.status) throw 'Data tidak ditemukan.';

  const gempa = json.data.auto.Infogempa.gempa;

  let teks = `*Info Gempa BMKG Terkini*\n\n` +
             `*Tanggal:* ${gempa.Tanggal}\n` +
             `*Jam:* ${gempa.Jam}\n` +
             `*Magnitudo:* ${gempa.Magnitude}\n` +
             `*Kedalaman:* ${gempa.Kedalaman}\n` +
             `*Lokasi:* ${gempa.Wilayah}\n` +
             `*Koordinat:* ${gempa.Coordinates} (${gempa.Lintang}, ${gempa.Bujur})\n` +
             `*Potensi:* ${gempa.Potensi}\n` +
             `*Dirasakan:* ${gempa.Dirasakan}`;

  await conn.sendMessage(m.chat, {
    text: teks,
    contextInfo: {
      externalAdReplyOffOffOff: {
        title: 'BMKG - Info Gempa Terkini',
        body: `Magnitude ${gempa.Magnitude} | ${gempa.Wilayah}`,
        thumbnailUrl: `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`,
        sourceUrl: 'https://bmkg.go.id',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m });
};

export default handler;

handler.command = ['infogempa'];
handler.tags = ['info'];
handler.help = ['infogempa'];