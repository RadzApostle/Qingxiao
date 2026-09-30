import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

var handler = async (m, { conn, text }) => {
    if (!text) throw `*Masukan Judul Anime Yang Ingin Kamu Cari !*`;

    let res = await fetch('https://api.jikan.moe/v4/anime?q=' + text);

    if (!res.ok) throw 'Tidak Ditemukan';

    let json = await res.json();
    let animeData = json.data[0];

    if (!animeData) throw 'Anime tidak ditemukan.';

    let {
        title_japanese,
        url,
        type,
        score,
        members,
        status,
        synopsis,
        favorites,
        images,
        genres,
    } = animeData;

    let genreList = genres.map((genre) => genre.name).join(', ');

    let animeingfo = `
Title: ${title_japanese}
Type: ${type}
Genres: ${genreList}
Score: ${score}
Members: ${members}
Status: ${status}
Favorites: ${favorites}
URL: ${url}
Synopsis: ${synopsis}
`;

    conn.sendFile(m.chat, images.jpg.image_url, 'anjime.jpg', `*ANIME INFO*\n` + animeingfo, m);
};

handler.help = ['animeinfo <anime>'];
handler.tags = ['anime'];
handler.command = /^(animeinfo)$/i;

handler.register = true

export default handler
