// confirm.js — 通用确认弹窗（Promise 化，替换原生 window.confirm）

/**
 * 弹出确认框
 * @param {string} message 提示内容
 * @param {Object} [opts]
 * @param {string} [opts.title] 弹窗标题
 * @param {boolean} [opts.danger] 危险操作（确认按钮显示为红色）
 * @returns {Promise<boolean>} true = 确认
 */
export function confirmDialog(message, { title = '确认操作', danger = false } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'confirm-overlay'
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-title"></div>
        <div class="confirm-message"></div>
        <div class="confirm-actions">
          <button class="c-cancel">取消</button>
          <button class="c-ok">确定</button>
        </div>
      </div>`
    overlay.querySelector('.confirm-title').textContent = title
    overlay.querySelector('.confirm-message').textContent = message
    const okBtn = overlay.querySelector('.c-ok')
    if (danger) okBtn.classList.add('danger')
    document.body.appendChild(overlay)

    const done = (value) => {
      overlay.remove()
      document.removeEventListener('keydown', onKey)
      resolve(value)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') done(false)
      else if (e.key === 'Enter') done(true)
    }
    document.addEventListener('keydown', onKey)
    overlay.querySelector('.c-cancel').addEventListener('click', () => done(false))
    overlay.addEventListener('click', (e) => { if (e.target === overlay) done(false) })
    okBtn.addEventListener('click', () => done(true))
    okBtn.focus()
  })
}
