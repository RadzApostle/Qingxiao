import axios from 'axios'

const fetch = async (url, opts = {}) => { const m = (opts.method||'GET').toLowerCase(); const r = await axios({method:m,url,headers:opts.headers||{},data:opts.body,responseType:'arraybuffer',timeout:30000,validateStatus:()=>true}); const b=Buffer.from(r.data); return {ok:r.status>=200&&r.status<300,status:r.status,statusText:r.statusText,headers:{get:(k)=>r.headers[k.toLowerCase()]},text:()=>Promise.resolve(b.toString('utf8')),json:()=>Promise.resolve(JSON.parse(b.toString('utf8'))),buffer:()=>Promise.resolve(b),arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))} }

let handler = {}

handler.before = async function (m) {
	try {
		if (!m?.text) return true

		if (m.fromMe || m.key?.fromMe || m.isBaileys) return true

		const conn = this

		const botJid =
			conn?.user?.jid ||
			conn?.user?.id ||
			''

		if (m.sender === botJid) return true

		const chat = global.db.data.chats?.[m.chat]

		if (!chat?.autosimi) return true
		if (chat.autogpt) return true

		if (/^[./#!$]/.test(m.text)) return true

		const text = m.text.trim()

		if (!text) return true

		const res = await fetch(
			`https://api.nexray.web.id/ai/simisimi?text=${encodeURIComponent(text)}`
		)

		if (!res.ok) return true

		const json = await res.json()

		const reply =
			json?.result ||
			json?.data?.result ||
			json?.data ||
			json?.message

		if (!reply || typeof reply !== 'string') return true

		await conn.sendMessage(
			m.chat,
			{
				text: reply
			},
			{
				quoted: m
			}
		)
	} catch (e) {
		console.log('AutoSimi Error:', e)
	}

	return true
}

export default handler