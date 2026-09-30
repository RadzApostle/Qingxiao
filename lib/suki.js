import axios from 'axios';

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
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const ryzenCDN = async (inp) => {
  try {
    const form = new FormData();
    const files = Array.isArray(inp) ? inp : [inp];

    for (const file of files) {
      const buffer = Buffer.isBuffer(file) ? file : file.buffer;
      if (!Buffer.isBuffer(buffer)) throw new Error('Invalid buffer format');

      const type = await fileTypeFromBuffer(buffer);
      if (!type) throw new Error('Unsupported file type');

      const originalName = (file.originalname || 'file').split('.').shift();
      
      form.append('file', buffer, {
        filename: `${originalName}.${type.ext}`,
        contentType: type.mime
      });
    }

    const res = await fetch('https://api.ryzendesu.vip/api/uploader/ryzencdn', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        ...form.getHeaders(),
      },
      body: form,
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Upload failed');

    return Array.isArray(inp) ? json.map(f => f.url) : json;
    
  } catch (error) {
    throw new Error(`RyzenCDN Error: ${error.message}`);
  }
};

export { ryzenCDN };