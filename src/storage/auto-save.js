// auto-save.js — 防抖自动保存

import { saveDraft } from './db.js'
import { showToast } from '../ui/toast.js'

let timer
let lastSavedContent = ''
let saving = false

/**
 * 防抖保存（停止输入 1 秒后写入）
 * @param {string} content
 */
export function scheduleAutoSave(content) {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (content === lastSavedContent || saving) return
    saving = true
    const ok = await saveDraft(content)
    saving = false
    if (ok) {
      lastSavedContent = content
    } else {
      showToast('保存失败，请检查存储空间', 'error')
    }
  }, 1000)
}

/**
 * 立即保存（用于 Ctrl+S）
 */
export async function saveNow(content) {
  clearTimeout(timer)
  saving = true
  const ok = await saveDraft(content)
  saving = false
  if (ok) {
    lastSavedContent = content
    showToast('已保存', 'success')
  } else {
    showToast('保存失败', 'error')
  }
  return ok
}

/** 初始化 lastSavedContent（首次加载后调用） */
export function initLastSaved(content) {
  lastSavedContent = content
}
