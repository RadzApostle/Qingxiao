import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `*Example:* ${usedPrefix + command} 112.90.150.204`;
  try {
    let res = await fetch(`https://ipwho.is/${text}`).then(result => result.json());
    await conn.sendMessage(m.chat, { location: { degreesLatitude: res.latitude, degreesLongitude: res.longitude }},{ ephemeralExpiration: 604800 });
    await delay(2000);
    conn.reply(m.chat, JSON.stringify(res, null, 2), m);  
  } catch (e) { 
    throw { error: `IP ${text} not found!` };
  }
}

handler.command = handler.help = ['ip']
handler.tags = ['tools']

handler.limit = true
handler.register = true

export default handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}