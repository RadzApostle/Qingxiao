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
import { fileTypeFromBuffer } from 'file-type'

/**
 * Upload epheremal file to file.io
 * `Expired in 1 day`
 * `100MB Max Filesize`
 * @param {Buffer} buffer File Buffer
 */
const fileIO = async buffer => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  let form = new FormData
  form.append('file', buffer, 'tmp.' + ext)
  let res = await fetch('https://file.io/?expires=1d', { // 1 Day Expiry Date
    method: 'POST',
    body: form
  })
  let json = await res.json()
  if (!json.success) throw json
  return json.link
}

/**
 * Upload file to storage.restfulapi.my.id
 * @param {Buffer|ReadableStream|(Buffer|ReadableStream)[]} inp File Buffer/Stream or Array of them
 * @returns {string|null|(string|null)[]}
 */
const RESTfulAPI = async inp => {
  let form = new FormData
  let buffers = inp
  if (!Array.isArray(inp)) buffers = [inp]
  for (let buffer of buffers) {
    form.append('file', buffer)
  }
  let res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form
  })
  let json = await res.text()
  try {
    json = JSON.parse(json)
    if (!Array.isArray(inp)) return json.files[0].url
    return json.files.map(res => res.url)
  } catch (e) {
    throw json
  }
}

export default async function (inp) {
  let err = false
  for (let upload of [RESTfulAPI, fileIO]) {
    try {
      return await upload(inp)
    } catch (e) {
      err = e
    }
  }
  if (err) throw err
}