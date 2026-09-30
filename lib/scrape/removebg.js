import axios from 'axios'

// fetch compat — routes through axios
const fetchCompat = async (url, opts = {}) => {
  const method = (opts.method || 'GET').toLowerCase()
  const headers = opts.headers || {}
  const body = opts.body
  const res = await axios({ method, url, headers, data: body, responseType: 'arraybuffer', timeout: 30000, validateStatus: () => true })
  const buf = Buffer.from(res.data)
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    statusText: res.statusText,
    headers: { get: (k) => res.headers[k.toLowerCase()] },
    text: () => Promise.resolve(buf.toString('utf8')),
    json: () => Promise.resolve(JSON.parse(buf.toString('utf8'))),
    buffer: () => Promise.resolve(buf),
    arrayBuffer: () => Promise.resolve(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)),
  }
}
const fetch = fetchCompat
import FormData from 'form-data'

export async function pixelcutRemove(buffer) {
  let form = new FormData()
  form.append('image', buffer, 'image.jpg')
  form.append('format', 'png')
  form.append('model', 'v1')

  let res = await fetch('https://api2.pixelcut.app/image/matte/v1', {
    method: 'POST',
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile)',
      'Accept': 'application/json, text/plain, */*',
      'x-client-version': 'web:pixa.com:4a5b0af2',
      'x-locale': 'en',
      'origin': 'https://www.pixa.com',
      'referer': 'https://www.pixa.com/',
    },
    body: form
  })

  if (!res.ok) throw new Error(await res.text())

  return Buffer.from(await res.arrayBuffer())
}


export async function removalAi(buffer) {
  let tokenRes = await fetch('https://removal.ai/wp-admin/admin-ajax.php?action=ajax_get_webtoken&security=d82109f663', {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })

  let token = (await tokenRes.json()).data.webtoken

  let form = new FormData()
  form.append('image_file', buffer, 'image.jpg')

  let res = await fetch('https://api.removal.ai/3.0/remove', {
    method: 'POST',
    headers: {
      'Web-Token': token,
      ...form.getHeaders()
    },
    body: form
  })

  let json = await res.json()

  if (!json.url) throw 'Gagal removebg'

  let img = await fetch(json.url)
  return Buffer.from(await img.arrayBuffer())
}