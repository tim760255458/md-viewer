// toast.js — Toast 提示组件

let container

function ensureContainer() {
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }
  return container
}

/**
 * @param {string} message
 * @param {'info' | 'success' | 'error'} type
 * @param {number} duration ms
 */
export function showToast(message, type = 'info', duration = 2400) {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = message
  ensureContainer().appendChild(el)

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(10px)'
    el.style.transition = 'all .2s'
    setTimeout(() => el.remove(), 200)
  }, duration)
}
