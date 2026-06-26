// layout.js — 布局模式切换（单栏/双栏）

import { isDesktop, watchBreakpoint } from './responsive.js'

/**
 * @param {Object} opts
 * @param {() => 'edit' | 'preview'} opts.getView
 * @param {(v: 'edit' | 'preview') => void} opts.setView
 */
export function initLayout({ getView, setView }) {
  const mainArea = document.querySelector('.main-area')
  const toggleBtn = document.getElementById('btn-toggle-view')
  let desktop = isDesktop()

  function render() {
    // 桌面端：添加 .desktop class，隐藏切换按钮
    if (desktop) {
      mainArea.classList.add('desktop')
      if (toggleBtn) toggleBtn.style.display = 'none'
    } else {
      // 移动端：移除 .desktop，根据 view 切换 show-preview
      mainArea.classList.remove('desktop')
      const view = getView()
      mainArea.classList.toggle('show-preview', view === 'preview')
      if (toggleBtn) {
        toggleBtn.style.display = ''
        toggleBtn.textContent = view === 'edit' ? '预览' : '编辑'
        toggleBtn.classList.toggle('active', view === 'preview')
      }
    }
  }

  // 绑定按钮
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      setView(getView() === 'edit' ? 'preview' : 'edit')
    })
  }

  // 监听断点
  watchBreakpoint((nowDesktop) => {
    desktop = nowDesktop
    render()
  })

  // 暴露重渲染方法
  return { render }
}
