// editor.js — CodeMirror 5 初始化、配置

import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/addon/edit/continuelist.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/selection/active-line.js'

/**
 * @param {HTMLElement} host
 * @param {(value: string) => void} onChange 防抖后的内容回调
 */
export function initEditor(host, onChange) {
  const cm = CodeMirror(host, {
    value: '',
    mode: 'markdown',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    styleActiveLine: true,
    continueUnorderedList: true,
    continueOrderedList: true,
    extraKeys: {
      'Enter': 'newlineAndIndentContinueMarkdownList',
      'Ctrl-S': (cm) => {
        // 快捷键由 shortcuts.js 处理，这里仅阻止默认保存
        window.dispatchEvent(new CustomEvent('md-viewer:save'))
      },
      'Cmd-S': (cm) => {
        window.dispatchEvent(new CustomEvent('md-viewer:save'))
      }
    }
  })

  // 内容变化时回调（编辑器内部已有微小防抖，但我们也加一层）
  let timer
  cm.on('change', () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      onChange(cm.getValue())
    }, 300)
  })

  return cm
}

/** 设置内容（不触发 change 事件） */
export function setValue(cm, value) {
  cm.operation(() => {
    const cursor = cm.getCursor()
    cm.setValue(value || '')
    try { cm.setCursor(cursor) } catch {}
  })
}
