let handler = async (m) => {
  let user = global.db.data.users[m.sender]

  let invalid = []

  function scan(obj, path = '') {
    for (let k in obj) {
      if (typeof obj[k] === 'number' && Number.isNaN(obj[k])) {
        invalid.push(path + k)
      }
    }
  }

  scan(user)

  m.reply(
    invalid.length
      ? invalid.join('\n')
      : 'Tidak ada field NaN'
  )
}

handler.command = /^cekdb$/i
handler.rowner = true

export default handler