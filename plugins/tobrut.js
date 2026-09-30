/* 
* Kode Dibuat Oleh Radz        
* Radz Bukan Dev        
* `wa.me/6288294268470`        
* `Channel: https://whatsapp.com/channel/0029VbAi5L1GehEJj8t9eG22`        
*/

import axios from 'axios'

async function ttSearch(query) {
   let response = await axios('https://tikwm.com/api/feed/search', {
         method: 'POST',
         data: {
               keywords: query,
               count: 12,
               cursor: 0,
               web: 1,
               hd: 1
         },
         headers: {
               "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
               "Cookie": "current_langange=en;",
               "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
         }
    })
    let date = response.data.data
    let video = date.videos
    if (!video || video.length === 0) {
        throw new Error('Tidak Ada Video Yang Di Temukan!')
    }
    let all = Math.floor(Math.random() * video.length)
    return {
        status: true,
        creator: 'Lann4you',
        result: {
              video_id: video[all].video_id,
              region: video[all].region,
              title: video[all].title,
              author: video[all].author.unique_id,
              nickname: video[all].author.nickname,
              profile: 'https://tikwm.com' + video[all].author.avatar,
              cover: 'https://tikwm.com' + video[all].cover,
              play: 'https://tikwm.com' + video[all].play,
              wm_play: 'https://tikwm.com' + video[all].wmplay,
              music: 'https://tikwm.com' + video[all].music,
              music_info: {
                  id: video[all].music_info.id,
                  title: video[all].music_info.title,
                  play_music: video[all].music_info.play
             }
          }
        }
}

let Radz = async(m, { text, conn, usedPrefix, command }) => {
   m.reply(global.wait)
   
   try {
       let response = await ttSearch('Tobrut pargoy')
       let { result } = response
       
       if (result) {
           let { author, play } = result
           let caption = `*Sange mulu lu bang🥵*\n✧ *Wm Creator:* ${author}`
           await conn.sendFile(m.chat, play, 'saa.mp4', caption, m)
       } else {
           m.reply(global.eror)
       }
   } catch (e) {
       console.error(e)
       m.reply(global.eror)
   }
}
Radz.help = ['tobrut']
Radz.tags = ['nsfw']
Radz.premium = true
Radz.command = /^(tobrut|tbrut)$/i

export default Radz
