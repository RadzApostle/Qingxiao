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

async function uploadImage(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}

  const form = new FormData()
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`)
  form.append('reqtype', 'fileupload')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  return await res.text()
}

async function uploadFile(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()

  form.append(
    'file',
    buffer,
    `upload-${Date.now()}.${ext || 'bin'}`
  )

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: form,
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const json = await res.json()
  const match = /https?:\/\/tmpfiles\.org\/(.*)/.exec(json?.data?.url)

  if (!match) throw new Error('Tmpfiles upload gagal')

  return `https://tmpfiles.org/dl/${match[1]}`
}

const uploadPomf = uploadFile

export default uploadImage
export { uploadFile, uploadPomf }