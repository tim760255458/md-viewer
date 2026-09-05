// history-panel.js — 历史记录面板（列表 / 单条恢复 / 单条删除 / 清空全部）

import { listHistory, deleteHistory, clearHistory } from '../storage/db.js'
import { showToast } from './toast.js'
import { confirmDialog } from './confirm.js'

/**
 * @param {Object} handlers
 * @param {(content: string) => void} handlers.onLoad 将选中历史恢复到编辑器
 */
export function initHistoryPanel({ onLoad }) {
  let overlay = null

  function formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    if (d.toDateString() === now.toDateString()) return `今天 ${hm}`
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return `昨天 ${hm}`
    return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
  }

  function snippet(content) {
    const line = (content.trim().split('\n')[0] || '').trim() || '(空内容)'
    return line.length > 60 ? line.slice(0, 60) + '…' : line
  }

  async function render() {
    const listEl = overlay.querySelector('.history-list')
    const items = await listHistory()
    if (!items.length) {
      listEl.innerHTML = ''
      const empty = document.createElement('div')
      empty.className = 'history-empty'
      empty.innerHTML = '还没有历史记录<br><small>输入内容后会自动保存在这里</small>'
      listEl.appendChild(empty)
      return
    }
    listEl.innerHTML = ''
    for (const item of items) {
      const row = document.createElement('div')
      row.className = 'history-item'
      row.innerHTML = `
        <div class="history-main">
          <div class="history-snippet"></div>
          <div class="history-time"></div>
        </div>
        <div class="history-actions">
          <button class="h-load" title="恢复到编辑器">打开</button>
          <button class="h-del" title="删除此条">🗑</button>
        </div>`
      row.querySelector('.history-snippet').textContent = snippet(item.content)
      row.querySelector('.history-time').textContent = formatTime(item.updatedAt)

      const load = () => {
        close()
        onLoad(item.content)
        showToast('已从历史恢复', 'success')
      }
      row.addEventListener('click', load)
      row.querySelector('.h-del').addEventListener('click', async (e) => {
        e.stopPropagation()
        if (!(await confirmDialog('删除这条历史记录？', { title: '删除历史', danger: true }))) return
        try {
          await deleteHistory(item.id)
          row.remove()
          if (!(await listHistory()).length) render()
          showToast('已删除该条历史', 'info')
        } catch (err) {
          console.error('删除历史失败:', err)
          showToast('删除失败', 'error')
        }
      })
      listEl.appendChild(row)
    }
  }

  function open() {
    if (overlay) return
    overlay = document.createElement('div')
    overlay.className = 'history-overlay'
    overlay.innerHTML = `
      <div class="history-panel">
        <div class="history-head">
          <span class="history-title">🕘 历史记录</span>
          <div class="history-head-actions">
            <button class="h-clear">清空全部</button>
            <button class="h-close" title="关闭">✕</button>
          </div>
        </div>
        <div class="history-list"></div>
      </div>`
    document.body.appendChild(overlay)
    overlay.querySelector('.h-close').addEventListener('click', close)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
    overlay.querySelector('.h-clear').addEventListener('click', async () => {
      if (!(await confirmDialog('确定清空全部历史记录？此操作不可恢复。', { title: '清空历史', danger: true }))) return
      try {
        await clearHistory()
        close()
        showToast('历史记录已清空', 'success')
      } catch (err) {
        console.error('清空历史失败:', err)
        showToast('清空失败', 'error')
      }
    })
    render()
  }

  function close() {
    overlay?.remove()
    overlay = null
  }

  return { open, close }
}
