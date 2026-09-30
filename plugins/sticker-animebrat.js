/*

# Fitur : Sticker Animebrat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb67i65Fi8xX7rOtIc2S
# Watermark : hanzxd
# Api : https://api.nexray.web.id

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

import axios from 'axios';

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import sharp from 'sharp';
import { Sticker } from 'wa-sticker-formatter'; // Tambahan untuk inject metadata (Exif)

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan teks untuk stiker.');

    try {
        const apiUrl = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const buffer = await response.arrayBuffer();

        // Konversi ke format webp agar bisa digunakan di WhatsApp
        const webpBuffer = await sharp(Buffer.from(buffer))
            .toFormat('webp')
            .toBuffer();

        // Proses penambahan watermark hanzxd ke metadata stiker
        const stickerWM = new Sticker(webpBuffer, {
            pack: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
            author: 'ʙy ʜɪʟᴍᴀɴ'
        });
        const finalSticker = await stickerWM.toBuffer();

        await conn.sendMessage(m.chat, { 
            sticker: finalSticker 
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply('Terjadi kesalahan saat membuat stiker.');
    }
};

handler.command = ['animebrat'];
handler.help = ['animebrat'];
handler.tags = ['sticker']; 

export default handler;