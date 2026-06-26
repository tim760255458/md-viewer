// preview.js — 预览区 DOM 操作

import { renderMarkdown } from './renderer.js'
import { ensureKatexStyles, hasMath } from './katex-loader.js'

/**
 * @param {HTMLElement} host 预览容器
 */
export function initPreview(host) {
  host.classList.add('preview-host', 'empty')

  let debounceTimer

  /**
   * 防抖渲染
   * @param {string} text
   */
  function update(text) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        if (!text || !text.trim()) {
          host.innerHTML = ''
          host.classList.add('empty')
          return
        }
        host.classList.remove('empty')

        // 检测数学公式，按需加载 KaTeX CSS
        if (hasMath(text)) {
          await ensureKatexStyles()
        }

        const html = renderMarkdown(text)
        host.innerHTML = html
      } catch (e) {
        console.error('Render error:', e)
        host.innerHTML = `<div style="color:#ef4444;padding:16px;">
          <strong>渲染出错：</strong>${escapeHtml(e.message)}
          <pre style="margin-top:8px;padding:8px;background:var(--color-code-bg);border-radius:4px;overflow-x:auto;">${escapeHtml(text)}</pre>
        </div>`
      }
    }, 200)
  }

  return { update }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

/**
 * 导出当前预览的完整 HTML
 */
export function exportHtml(text, title = 'document') {
  const body = renderMarkdown(text)
  const isDark = document.documentElement.classList.contains('dark')
  const cssVar = isDark
    ? `--color-bg:#1a1a1a;--color-fg:#e5e7eb;--color-border:#374151;--color-code-bg:#2d2d2d;--color-surface:#252525;`
    : `--color-bg:#ffffff;--color-fg:#1f2937;--color-border:#e5e7eb;--color-code-bg:#f3f4f6;--color-surface:#f9fafb;`

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
:root { ${cssVar} }
* { box-sizing: border-box; }
body { max-width: 760px; margin: 0 auto; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--color-bg); color: var(--color-fg); line-height: 1.7; }
img { max-width: 100%; border-radius: 6px; }
a { color: #4f46e5; }
pre { background: var(--color-code-bg); padding: 14px 16px; border-radius: 8px; overflow-x: auto; }
code { font-family: ui-monospace, monospace; padding: 0.15em 0.35em; background: var(--color-code-bg); border-radius: 4px; font-size: 0.88em; }
pre code { background: transparent; padding: 0; }
blockquote { border-left: 4px solid #4f46e5; margin: 0.8em 0; padding: 0.2em 1em; background: var(--color-surface); border-radius: 0 6px 6px 0; color: var(--color-fg); opacity: 0.85; }
table { border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid var(--color-border); padding: 8px 12px; }
th { background: var(--color-surface); }
h1, h2 { border-bottom: 1px solid var(--color-border); padding-bottom: .3em; }
</style>
</head>
<body>
${body}
</body>
</html>`
}
