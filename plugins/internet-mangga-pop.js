import axios from 'axios';

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }
import cheerio from 'cheerio';

// Ini Scrape Nya
async function fetchMangaList() {
    try {
        const url = "https://natsu.id";
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Gagal mengambil data dari ${url}, status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const mangaList = [];

        $(".listupd.popularslider .bs").each((_, element) => {
            const title = $(element).find(".bigor .tt").text().trim();
            const chapter = $(element).find(".bigor .epxs").text().trim();
            const rating = $(element).find(".bigor .numscore").text().trim();
            const link = $(element).find("a").attr("href");
            const image = $(element).find("img").attr("src");

            if (title && link) { 
                mangaList.push({
                    title,
                    chapter,
                    rating,
                    link,
                    image,
                });
            }
        });

        return mangaList;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}
//Batas Scrape 

const handler = async (m, { conn }) => {
    m.reply('Please Wait....');
    const mangaList = await fetchMangaList();

    if (mangaList.length === 0) {
        return m.reply('❌ Gagal mengambil daftar manga. Silakan coba lagi nanti.');
    }

    for (const manga of mangaList.slice(0, 5)) { //Max Mengirim 5 (Ubah Sendiri Juga Bisa)
        const caption = `
📖 *${manga.title}*
📄 Chapter: ${manga.chapter}
⭐ Rating: ${manga.rating || 'N/A'}
🔗 Link: ${manga.link}
        `.trim();

        
        await conn.sendMessage(
            m.chat,
            {
                image: { url: manga.image }, 
                caption: caption, 
            },
            { quoted: m }
        );
    }

    m.reply('');
};

handler.help = ['mangga-pop'].map(v => v + ' ');
handler.command = /^mangalist$/i;
handler.tags = ["internet"]
handler.limit = false;

export default handler;