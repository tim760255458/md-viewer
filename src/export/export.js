// export.js — 下载 .md / 导出 HTML

import { exportHtml } from '../preview/preview.js'

const DEFAULT_FILENAME = 'document.md'

/**
 * 下载 Markdown 文件
 * @param {string} content
 * @param {string} filename 默认 document.md
 */
export function downloadMarkdown(content, filename = DEFAULT_FILENAME) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  triggerDownload(blob, filename)
}

/**
 * 导出渲染后的 HTML 文件
 * @param {string} content markdown 源码
 * @param {string} filename 默认 document.html
 */
export function exportHtmlFile(content, filename = 'document.html') {
  const html = exportHtml(content, filename.replace(/\.html?$/, ''))
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  triggerDownload(blob, filename)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
