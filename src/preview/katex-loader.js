// katex-loader.js — KaTeX 按需动态加载

let katexLoaded = false
let loadingPromise = null

/**
 * 检测文本是否包含数学公式分隔符
 */
export function hasMath(content) {
  return /\$\$|\\\[|\\\(|\$[^$]/.test(content)
}

/**
 * 动态加载 KaTeX 样式
 * （插件 @iktakahiro/markdown-it-katex 已将 KaTeX 作为依赖，渲染时使用）
 * 这里负责注入 KaTeX 的 CSS
 */
export async function ensureKatexStyles() {
  if (katexLoaded) return
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      // 动态 import CSS（Vite 会处理）
      await import('katex/dist/katex.min.css')
      katexLoaded = true
    } catch (e) {
      console.warn('KaTeX CSS 加载失败，公式将以源码显示:', e)
    }
  })()

  return loadingPromise
}
