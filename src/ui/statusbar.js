// statusbar.js — 编辑器底部状态栏（字数 / 字符数 / 预计阅读时长）

const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]/g
const WORD_RE = /[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*/g

/**
 * 统计文本
 * @param {string} text
 * @returns {{ units: number, chars: number, minutes: number }}
 *   units = 中文字数 + 英文单词数；chars = 非空白字符数；minutes = 预计阅读分钟数
 */
export function computeStats(text) {
  const cjk = (text.match(CJK_RE) || []).length
  const words = (text.replace(CJK_RE, ' ').match(WORD_RE) || []).length
  const chars = text.replace(/\s/g, '').length
  const units = cjk + words
  const minutes = units === 0 ? 0 : Math.max(1, Math.round(units / 250))
  return { units, chars, minutes }
}

/**
 * 在编辑器面板底部挂一个状态栏
 * @param {HTMLElement} host .pane-editor 元素
 * @returns {{ update: (content: string) => void }}
 */
export function initStatusBar(host) {
  const bar = document.createElement('div')
  bar.className = 'status-bar'
  host.appendChild(bar)

  function update(content) {
    const { units, chars, minutes } = computeStats(content || '')
    bar.textContent = units
      ? `${units} 字 · ${chars} 字符 · 约 ${minutes} 分钟读完`
      : '0 字'
  }

  update('')
  return { update }
}
