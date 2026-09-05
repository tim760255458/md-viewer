// main.js — 入口：组装所有模块

import './style.css'

import { initEditor, setValue, clearAll } from './editor/editor.js'
import { initShortcuts } from './editor/shortcuts.js'
import { initPreview } from './preview/preview.js'
import { loadDraft, addHistory, listHistory } from './storage/db.js'
import { scheduleAutoSave, saveNow, initLastSaved } from './storage/auto-save.js'
import { initToolbar, updateThemeButton } from './ui/toolbar.js'
import { initHistoryPanel } from './ui/history-panel.js'
import { initStatusBar } from './ui/statusbar.js'
import { buildShareUrl, readShareHash, copyToClipboard } from './share/share-link.js'
import { initFileReader } from './file/file-reader.js'
import { downloadMarkdown, exportHtmlFile } from './export/export.js'
import { initLayout } from './layout/layout.js'
import { applyTheme, watchSystemTheme } from './theme/theme.js'
import { initUpdateNotify } from './pwa/update-notify.js'
import { showToast } from './ui/toast.js'
import { confirmDialog } from './ui/confirm.js'

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
    onClearEditor: async () => {
      if (!currentContent) {
        showToast('内容已经是空的', 'info')
        editor.focus()
        return
      }
      if (!(await confirmDialog('确定清空编辑器内容？清空后可按 Ctrl+Z 撤销。', { title: '清空内容', danger: true }))) return
      clearAll(editor)
      showToast('已清空，Ctrl+Z 可撤销', 'success')
    },
    onOpenFile: () => fileReader.pick(),
    onOpenHistory: () => historyPanel.open(),
    onShareLink: async () => {
      if (!currentContent) {
        showToast('内容为空', 'error')
        return
      }
      try {
        const url = await buildShareUrl(currentContent)
        await copyToClipboard(url)
        showToast('分享链接已复制到剪贴板', 'success')
      } catch (e) {
        console.error('生成分享链接失败:', e)
        showToast(e.message === '内容太长，超出分享链接上限' ? e.message : '生成分享链接失败', 'error')
      }
    },
    onDownloadMd: async () => {
      if (!currentContent) {
        showToast('内容为空', 'error')
        return
      }
      if (!(await confirmDialog('确定下载当前内容为 .md 文件？', { title: '下载文件' }))) return
      downloadMarkdown(currentContent)
      showToast('已下载 .md', 'success')
    },
    onExportHtml: async () => {
      if (!currentContent) {
        showToast('内容为空', 'error')
        return
      }
      if (!(await confirmDialog('确定导出当前内容为 HTML 文件？', { title: '导出文件' }))) return
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
    scheduleHistory(value)
    statusBar.update(value)
  })

  // ---- 状态栏（字数统计）----
  const statusBar = initStatusBar(document.querySelector('.pane-editor'))

  // ---- 历史面板 ----
  const historyPanel = initHistoryPanel({
    onLoad: (content) => {
      currentContent = content
      setValue(editor, content)
      preview.update(content)
      scheduleAutoSave(content)
      lastHistoryContent = content // 恢复历史不算新记录
    }
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

  // ---- 历史记录（内容停止变化 3 秒后记一条快照，与最近一条去重） ----
  let historyTimer
  let lastHistoryContent = null
  function scheduleHistory(content) {
    clearTimeout(historyTimer)
    historyTimer = setTimeout(async () => {
      if (!content || content === lastHistoryContent) return
      try {
        await addHistory(content)
        lastHistoryContent = content
      } catch (e) {
        console.error('历史记录失败:', e)
      }
    }, 3000)
  }

  // 初始化：与最近一条历史对齐，避免启动加载草稿时重复记录
  listHistory().then((items) => {
    if (items.length) lastHistoryContent = items[0].content
  })

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

  // ---- 分享链接导入（优先级高于本地草稿） ----
  const shared = await readShareHash()
  if (shared) {
    currentContent = shared
    setValue(editor, shared)
    preview.update(shared)
    scheduleAutoSave(shared)
    showToast('已加载分享内容，可编辑后保存为自己的', 'success')
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
