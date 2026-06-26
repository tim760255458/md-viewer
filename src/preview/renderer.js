// renderer.js — markdown-it 实例 + 插件配置 + Prism 高亮

import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import footnote from 'markdown-it-footnote'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import deflist from 'markdown-it-deflist'
import abbr from 'markdown-it-abbr'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import { full as emoji } from 'markdown-it-emoji'
import taskLists from 'markdown-it-task-lists'
import katexPlugin from '@iktakahiro/markdown-it-katex'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-tsx.js'
import 'prismjs/components/prism-css.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-bash.js'
import 'prismjs/components/prism-python.js'
import 'prismjs/components/prism-go.js'
import 'prismjs/components/prism-rust.js'
import 'prismjs/components/prism-java.js'
import 'prismjs/components/prism-c.js'
import 'prismjs/components/prism-cpp.js'
import 'prismjs/components/prism-csharp.js'
import 'prismjs/components/prism-sql.js'
import 'prismjs/components/prism-yaml.js'
import 'prismjs/components/prism-markdown.js'
import 'prismjs/components/prism-xml-doc.js'
import 'prismjs/components/prism-powershell.js'
import 'prismjs/components/prism-shell-session.js'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        const highlighted = Prism.highlight(str, Prism.languages[lang], lang)
        return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`
      } catch (e) {
        console.warn('Prism highlight error:', e)
      }
    }
    return '' // 使用默认转义
  }
})

md.use(anchor, { permalink: false, level: [1, 2, 3] })
md.use(footnote)
md.use(sub)
md.use(sup)
md.use(deflist)
md.use(abbr)
md.use(ins)
md.use(mark)
md.use(emoji)
md.use(taskLists, { enabled: true, label: true })
md.use(katexPlugin, { throwOnError: false, errorColor: '#ef4444' })

// 渲染并后处理：lazy img + 外链 rel
export function renderMarkdown(text) {
  if (!text) return ''
  let html = md.render(text)

  // 图片懒加载
  html = html.replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')

  // 外链加 rel
  html = html.replace(/<a href="(https?:|\/\/)/gi, '<a rel="noopener noreferrer" target="_blank" href="$1')

  return html
}

export default md
