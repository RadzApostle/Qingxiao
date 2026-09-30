let handler = async (m, { conn, command }) => {
    let types = {
        ass: 'ass',
        boobs: 'boobs',
        pussy: 'pussy',
        hentai: 'hentai',
        cosplay: 'cosplay',
        thighs: 'thigh'
    };
    let type = types[command] || 'boobs';
    let res = await fetch(`https://nekobot.xyz/api/image?type=${type}`);
    let json = await res.json();
    if (!json.success || !json.message) throw 'Failed to fetch image.';
    await conn.sendMessage(m.chat, { image: { url: json.message } }, { quoted: m });
};

handler.command = ['ass', 'boobs', 'pussy', 'hentai', 'cosplay', 'thighs'];
handler.help = ['ass', 'boobs', 'pussy', 'hentai', 'cosplay', 'thighs'];
handler.tags = ['nsfw'];
handler.premium = true

export default handler;