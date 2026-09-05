// share-link.js — 把内容压缩进 URL hash，生成分享链接 / 读取分享内容

const PREFIX = '#s='

function bytesToBase64url(bytes) {
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const bin = atob(b64 + pad)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** deflate 压缩（浏览器原生 CompressionStream） */
async function deflate(str) {
  const cs = new CompressionStream('deflate-raw')
  const stream = new Blob([new TextEncoder().encode(str)]).stream().pipeThrough(cs)
  const buf = await new Response(stream).arrayBuffer()
  return bytesToBase64url(new Uint8Array(buf))
}

/** 解压 */
async function inflate(b64) {
  const ds = new DecompressionStream('deflate-raw')
  const stream = new Blob([base64urlToBytes(b64)]).stream().pipeThrough(ds)
  const buf = await new Response(stream).arrayBuffer()
  return new TextDecoder().decode(buf)
}

/**
 * 生成分享链接
 * @param {string} content
 * @returns {Promise<string>} 完整可分享的 URL
 * @throws {Error} 内容过长或浏览器不支持时抛出
 */
export async function buildShareUrl(content) {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('浏览器不支持 CompressionStream')
  }
  const hash = PREFIX + (await deflate(content))
  const url = location.origin + location.pathname + hash
  if (url.length > 60000) {
    throw new Error('内容太长，超出分享链接上限')
  }
  return url
}

/**
 * 读取并消费 URL hash 中的分享内容（读取后清除 hash）
 * @returns {Promise<string|null>} 有分享内容则返回字符串，否则 null
 */
export async function readShareHash() {
  const hash = location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    const content = await inflate(hash.slice(PREFIX.length))
    history.replaceState(null, '', location.pathname + location.search)
    return content
  } catch (e) {
    console.error('解析分享链接失败:', e)
    history.replaceState(null, '', location.pathname + location.search)
    return null
  }
}

/** 复制文本到剪贴板（带 execCommand 兜底） */
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  ta.remove()
  if (!ok) throw new Error('复制失败')
}
