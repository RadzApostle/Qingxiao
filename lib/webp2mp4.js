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
import { JSDOM } from 'jsdom';
/**
 * 
 * @param {Buffer|String} source 
 */

async function webp2mp4(source) {
  let form = new FormData
  let isUrl = typeof source === 'string' && /https?:\/\//.test(source)
  form.append('new-image-url', isUrl ? source : '')
  form.append('new-image', isUrl ? '' : source, 'image.webp')
  let res = await fetch('https://ezgif.com/webp-to-mp4', {
    method: 'POST',
    body: form
  })
  let html = await res.text()
  let { document } = new JSDOM(html).window
  let form2 = new FormData
  let obj = {}
  for (let input of document.querySelectorAll('form input[name]')) {
    obj[input.name] = input.value
    form2.append(input.name, input.value)
  }
  let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
    method: 'POST',
    body: form2
  })
  let html2 = await res2.text()
  let { document: document2 } = new JSDOM(html2).window
  return new URL(document2.querySelector('div#output > p.outfile > video > source').src, res2.url).toString()
}

async function webp2png(source) {
  let form = new FormData
  let isUrl = typeof source === 'string' && /https?:\/\//.test(source)
  form.append('new-image-url', isUrl ? source : '')
  form.append('new-image', isUrl ? '' : source, 'image.webp')
  let res = await fetch('https://ezgif.com/webp-to-png', {
    method: 'POST',
    body: form
  })
  let html = await res.text()
  let { document } = new JSDOM(html).window
  let form2 = new FormData
  let obj = {}
  for (let input of document.querySelectorAll('form input[name]')) {
    obj[input.name] = input.value
    form2.append(input.name, input.value)
  }
  let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, {
    method: 'POST',
    body: form2
  })
  let html2 = await res2.text()
  let { document: document2 } = new JSDOM(html2).window
  return new URL(document2.querySelector('div#output > p.outfile > img').src, res2.url).toString()
}

export {
  webp2mp4,
  webp2png
}