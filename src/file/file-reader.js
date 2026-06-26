// file-reader.js — 拖拽 + input 文件读取

import { showToast } from '../ui/toast.js'

/**
 * @param {Object} opts
 * @param {(content: string, filename: string) => void} opts.onLoad
 * @param {HTMLElement} opts.dropZone 拖拽目标区
 */
export function initFileReader({ onLoad, dropZone }) {
  // 创建隐藏的 file input
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.markdown,.txt,text/markdown,text/plain'
  input.style.display = 'none'
  document.body.appendChild(input)

  input.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (file) await readFile(file, onLoad)
    input.value = ''
  })

  // 拖拽事件
  const zone = dropZone || document
  zone.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  })
  zone.addEventListener('drop', async (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) await readFile(file, onLoad)
  })

  // 返回触发器（供工具栏按钮调用）
  return {
    pick() { input.click() }
  }
}

async function readFile(file, onLoad) {
  // 校验类型
  const validTypes = ['.md', '.markdown', '.txt']
  const name = file.name.toLowerCase()
  const valid = validTypes.some((ext) => name.endsWith(ext)) ||
                file.type === 'text/markdown' ||
                file.type === 'text/plain'
  if (!valid) {
    showToast('仅支持 .md / .markdown / .txt 文件', 'error')
    return
  }

  try {
    const content = await file.text()
    onLoad(content, file.name)
  } catch (e) {
    console.error('文件读取失败:', e)
    showToast('无法读取文件，请检查文件格式', 'error')
  }
}
