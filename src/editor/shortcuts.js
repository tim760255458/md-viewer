// shortcuts.js — 全局键盘快捷键

export function initShortcuts({ onSave }) {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onSave?.()
    }
  })
}
