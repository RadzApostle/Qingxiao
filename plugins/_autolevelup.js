import { canLevelUp } from '../lib/levelling.js'
import { canvasLevelUp } from '../lib/canvaslevelup.js'

let handler = m => m

handler.before = async function (m) {
	if (m.fromMe || m.isBaileys) return true

	const botNumber = this.user?.id?.split(':')[0] + '@s.whatsapp.net'
	if (m.sender === botNumber) return true

	let user = global.db.data.users[m.sender]
	let chat = global.db.data.chats[m.chat]

	if (!user || !chat) return true

	let before = user.level * 1

	if (chat.autolevelup) {
		while (canLevelUp(user.level, user.exp, global.multiplier)) {
			user.level++
		}
	}

	let role =
		user.level <= 2
			? 'Newbie ㋡'
			: user.level >= 2 && user.level <= 4
				? 'Beginner 1 ⚊¹'
				: user.level >= 4 && user.level <= 6
					? 'Beginner 2 ⚊²'
					: user.level >= 6 && user.level <= 8
						? 'Beginner 3 ⚊³'
						: user.level >= 8 && user.level <= 10
							? 'Beginner 4 ⚊⁴'
							: user.level >= 10 && user.level <= 20
								? 'Adventurer 1 ⚌¹'
								: user.level >= 20 && user.level <= 30
									? 'Adventurer 2 ⚌²'
									: user.level >= 30 && user.level <= 40
										? 'Adventurer 3 ⚌³'
										: user.level >= 40 && user.level <= 50
											? 'Adventurer 4 ⚌⁴'
											: user.level >= 50 && user.level <= 60
												? 'Adventurer 5 ⚌⁵'
												: user.level >= 60 && user.level <= 70
													? 'Fighter 1 ☰¹'
													: user.level >= 70 && user.level <= 80
														? 'Fighter 2 ☰²'
														: user.level >= 80 && user.level <= 90
															? 'Fighter 3 ☰³'
															: user.level >= 90 && user.level <= 100
																? 'Fighter 4 ☰⁴'
																: user.level >= 100 && user.level <= 110
																	? 'Fighter 5 ☰⁵'
																	: user.level >= 110 && user.level <= 120
																		? 'Brigand 1 ≣¹'
																		: user.level >= 120 && user.level <= 130
																			? 'Brigand 2 ≣²'
																			: user.level >= 130 && user.level <= 140
																				? 'Brigand 3 ≣³'
																				: user.level >= 140 && user.level <= 150
																					? 'Brigand 4 ≣⁴'
																					: user.level >= 150 && user.level <= 160
																						? 'Brigand 5 ≣⁵'
																						: user.level >= 160 && user.level <= 170
																							? 'Swordsman 1 ﹀¹'
																							: user.level >= 170 && user.level <= 180
																								? 'Swordsman 2 ﹀²'
																								: user.level >= 180 && user.level <= 190
																									? 'Swordsman 3 ﹀³'
																									: user.level >= 190 && user.level <= 200
																										? 'Swordsman 4 ﹀⁴'
																										: user.level >= 200 && user.level <= 210
																											? 'Swordsman 5 ﹀⁵'
																											: user.level >= 210
																												? '𖤐 G O D 𖤐'
																												: 'Newbie ㋡'

	user.role = role

	if (chat.autolevelup && before !== user.level) {
		let pp = null

		try {
			pp = await this.profilePictureUrl(m.sender, 'image')
		} catch {}

		const buffer = await canvasLevelUp(
			pp,
			await this.getName(m.sender),
			before,
			user.level,
			user.role
		)

		await this.sendMessage(
			m.chat,
			{
				image: buffer,
				caption: `🎉 Selamat! Kamu naik ke level ${user.level}`
			},
			{ quoted: m }
		)
	}

	return true
}

export default handler