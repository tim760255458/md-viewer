// toolbar.js — 工具栏按钮渲染与事件绑定

import { cycleTheme, getThemeMode } from '../theme/theme.js'
import { showToast } from './toast.js'

/**
 * 构建工具栏 DOM 并绑定事件
 * @param {Object} handlers
 * @param {() => void} handlers.onOpenFile
 * @param {() => void} handlers.onDownloadMd
 * @param {() => void} handlers.onExportHtml
 * @param {(view: 'edit' | 'preview') => void} handlers.onToggleView
 * @param {() => string} handlers.getContent
 */
export function initToolbar(handlers) {
  const app = document.getElementById('app')
  const toolbar = document.createElement('div')
  toolbar.className = 'toolbar'
  toolbar.innerHTML = `
    <button id="btn-open" title="打开 .md 文件">📂<span class="label">打开</span></button>
    <button id="btn-download" title="下载 .md">💾<span class="label">下载</span></button>
    <button id="btn-export-html" title="导出 HTML">📄<span class="label">导出</span></button>
    <div class="spacer"></div>
    <button id="btn-toggle-view" title="切换编辑/预览">预览</button>
    <button id="btn-theme" title="切换主题">🌙</button>
  `
  app.insertBefore(toolbar, app.firstChild)

  document.getElementById('btn-open').addEventListener('click', handlers.onOpenFile)
  document.getElementById('btn-download').addEventListener('click', handlers.onDownloadMd)
  document.getElementById('btn-export-html').addEventListener('click', handlers.onExportHtml)
  document.getElementById('btn-theme').addEventListener('click', () => {
    cycleTheme()
    updateThemeButton()
  })

  updateThemeButton()
}

export function updateThemeButton() {
  const btn = document.getElementById('btn-theme')
  if (!btn) return
  const mode = getThemeMode()
  const labels = { light: '☀️', dark: '🌙', auto: '🖥' }
  btn.textContent = labels[mode] || '🌙'
  btn.title = `主题: ${mode}`
}
