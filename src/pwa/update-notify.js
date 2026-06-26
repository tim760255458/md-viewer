// update-notify.js — SW 版本检测 + 更新提示

import { showToast } from '../ui/toast.js'

export function initUpdateNotify() {
  if (!('serviceWorker' in navigator)) return

  let registration

  navigator.serviceWorker.ready.then((reg) => {
    registration = reg
    // 检查是否有等待中的新 SW
    if (reg.waiting) showUpdateBanner(reg)
    // 监听新 SW 进入 waiting 状态
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing
      if (!newWorker) return
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && reg.waiting) {
          showUpdateBanner(reg)
        }
      })
    })
  }).catch((e) => {
    // SW 注册失败，静默
    console.debug('SW 注册失败:', e)
  })

  // 监听控制权变化
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

function showUpdateBanner(registration) {
  if (document.querySelector('.update-banner')) return

  const banner = document.createElement('div')
  banner.className = 'update-banner'
  banner.innerHTML = `
    <span>有新版本可用</span>
    <button id="btn-update-refresh">刷新</button>
  `
  document.body.appendChild(banner)

  document.getElementById('btn-update-refresh').addEventListener('click', () => {
    if (registration?.waiting) {
      // 通知等待中的 SW 跳过 waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  })

  // 5 秒后自动消失（用户可手动关闭）
  setTimeout(() => {
    banner.style.opacity = '0'
    banner.style.transition = 'opacity .3s'
    setTimeout(() => banner.remove(), 300)
  }, 8000)
}
