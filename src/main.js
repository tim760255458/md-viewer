// main.js — 入口：组装所有模块

import './style.css'

import { initEditor, setValue } from './editor/editor.js'
import { initShortcuts } from './editor/shortcuts.js'
import { initPreview } from './preview/preview.js'
import { loadDraft } from './storage/db.js'
import { scheduleAutoSave, saveNow, initLastSaved } from './storage/auto-save.js'
import { initToolbar, updateThemeButton } from './ui/toolbar.js'
import { initFileReader } from './file/file-reader.js'
import { downloadMarkdown, exportHtmlFile } from './export/export.js'
import { initLayout } from './layout/layout.js'
import { applyTheme, watchSystemTheme } from './theme/theme.js'
import { initUpdateNotify } from './pwa/update-notify.js'
import { showToast } from './ui/toast.js'

async function main() {
  // ---- 构建主结构 ----
  const app = document.getElementById('app')

  const mainArea = document.createElement('div')
  mainArea.className = 'main-area'
  mainArea.innerHTML = `
    <div class="pane pane-editor">
      <div class="editor-host" id="editor-host"></div>
    </div>
    <div class="pane pane-preview">
      <div class="preview-host" id="preview-host"></div>
    </div>
  `
  app.appendChild(mainArea)

  // ---- 状态 ----
  let currentView = 'edit' // 'edit' | 'preview'
  let currentContent = ''

  // ---- 工具栏 ----
  const fileReader = initFileReader({
    onLoad: (content, filename) => {
      currentContent = content
      setValue(editor, content)
      preview.update(content)
      scheduleAutoSave(content)
      showToast(`已加载: ${filename}`, 'success')
    },
    dropZone: document.body
  })

  initToolbar({
    onOpenFile: () => fileReader.pick(),
    onDownloadMd: () => {
      if (!currentContent) {
        showToast('内容为空', 'error')
        return
      }
      downloadMarkdown(currentContent)
      showToast('已下载 .md', 'success')
    },
    onExportHtml: () => {
      if (!currentContent) {
        showToast('内容为空', 'error')
        return
      }
      exportHtmlFile(currentContent)
      showToast('已导出 HTML', 'success')
    },
    onToggleView: (v) => { currentView = v; layoutApi.render() },
    getContent: () => currentContent
  })

  // ---- 编辑器 ----
  const editor = initEditor(document.getElementById('editor-host'), (value) => {
    currentContent = value
    preview.update(value)
    scheduleAutoSave(value)
  })

  // ---- 预览 ----
  const preview = initPreview(document.getElementById('preview-host'))

  // ---- 布局 ----
  // 先给 mainArea 加初始状态（默认单栏，只显示编辑区）
  // JS 在桌面端会补加 .desktop class
  const layoutApi = initLayout({
    getView: () => currentView,
    setView: (v) => { currentView = v; layoutApi.render() }
  })
  layoutApi.render()

  // ---- 快捷键 ----
  initShortcuts({
    onSave: () => saveNow(currentContent)
  })

  // ---- 主题 ----
  applyTheme()
  watchSystemTheme()

  // ---- PWA 更新通知 ----
  initUpdateNotify()

  // ---- 加载草稿 ----
  const saved = await loadDraft()
  if (saved) {
    currentContent = saved
    setValue(editor, saved)
    preview.update(saved)
    initLastSaved(saved)
  }

  // 默认在桌面端聚焦编辑器
  editor.refresh()
  editor.focus()

  // ---- 标记就绪 ----
  app.classList.add('ready')
  document.title = 'MD Viewer'

  console.log('[md-viewer] 初始化完成')
}

main().catch((e) => {
  console.error('初始化失败:', e)
  showToast('应用初始化失败', 'error')
})
