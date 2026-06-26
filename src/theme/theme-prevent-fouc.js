/**
 * theme-prevent-fouc.js
 * 提供主题状态读写，供主模块和 index.html 内联脚本共用。
 */

const STORAGE_KEY = 'md-viewer-theme'
const META_THEME_COLOR = 'meta-theme-color'
const LIGHT_BG = '#ffffff'
const DARK_BG = '#1a1a1a'

/** 读取主题模式：'light' | 'dark' | 'auto' */
export function getThemeMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'auto'
  } catch {
    return 'auto'
  }
}

/** 保存主题模式 */
export function setThemeMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {}
  applyTheme(mode)
}

/** 循环切换：light → dark → auto → light */
export function cycleTheme() {
  const map = { light: 'dark', dark: 'auto', auto: 'light' }
  setThemeMode(map[getThemeMode()] || 'light')
}

/** 将主题模式应用为 HTML class + meta */
export function applyTheme(mode = getThemeMode()) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'auto' && prefersDark)

  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  const meta = document.getElementById(META_THEME_COLOR)
  if (meta) {
    meta.setAttribute('content', isDark ? DARK_BG : LIGHT_BG)
  }

  return isDark ? 'dark' : 'light'
}

/** 监听系统主题变化（仅当模式为 auto 时生效） */
export function watchSystemTheme() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (getThemeMode() === 'auto') applyTheme('auto')
  })
}

/** 返回当前激活主题名（resolved）：'light' | 'dark' */
export function getResolvedTheme() {
  const mode = getThemeMode()
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return (mode === 'dark' || (mode === 'auto' && prefersDark)) ? 'dark' : 'light'
}
