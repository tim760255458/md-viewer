# md-viewer — Project Plan

> 通用 Markdown 编辑/预览网页工具 · 移动端优先 · PWA · 无后台

---

## 1. 项目概览

### 1.1 一句话定位
在浏览器里写 Markdown、实时预览、离线可用、安装即用。

### 1.2 核心价值
- 打开即用，无需安装 App
- 离线可用（PWA standalone）
- 主题自动跟随系统 + 手动覆盖
- 全功能 Markdown（GFM + KaTeX + Emoji + 脚注 + …）

### 1.3 技术栈
| 层 | 选型 |
|----|------|
| 构建 | Vite |
| UI 框架 | 纯原生 JS（零运行时框架） |
| CSS | Tailwind CSS |
| 编辑器 | CodeMirror 5（markdown 模式） |
| Markdown 渲染 | markdown-it（全插件栈） |
| 代码高亮 | Prism.js（按需语言） |
| 数学公式 | KaTeX（按需动态 import） |
| PWA | Workbox（`vite-plugin-pwa`） |
| 持久化 | IndexedDB（`idb` wrapper） |

### 1.4 砍掉清单
| 功能 | 原因 |
|------|------|
| Mermaid 图表 | 体积过大（~1MB+），移动端体验差 |
| URL 拉取 markdown | 威胁面 + 复杂度，场景弱 |
| 表格排序 | 用户未要求 |
| TOC 自动生成 | 用户未要求 |
| 编辑/预览滚动同步 | 复杂度高，用户未要求 |
| 多文档管理 | 单文档够用 |
| 自动化测试 | 单人项目，手动验证 |
| 自定义图标 | 功能优先，占位图标先行 |

---

## 2. 用户交互

### 2.1 内容入口
- **粘贴**：打开页面直接粘贴 Markdown 文本
- **拖拽**：桌面端拖 `.md` 文件到页面
- **文件选择**：按钮触发 `<input type="file" accept=".md,.markdown,.txt">`

### 2.2 内容出口
- **下载 `.md`**：生成 Blob 下载，文件名默认 `document.md`
- **导出 HTML**：渲染后的完整 HTML 页面下载

### 2.3 布局策略

| 视口 | 模式 | 行为 |
|------|------|------|
| < 1024px | 单视图 | 编辑 ⇄ 预览切换按钮 |
| ≥ 1024px | 并排双栏 | 左编辑、右预览，可手动切回单视图 |

- 单视图切换：一个按钮在"编辑源码"和"渲染预览"之间来回切
- 双栏：各占 50% 宽度，各自独立滚动

### 2.4 主题切换
- **三态循环**：亮色 → 暗色 → 自动（跟随系统）
- **存储**：手动选择存入 `localStorage`
- **防闪屏**：`<head>` 内联阻塞脚本，先读 `localStorage` 设 `class` 再渲染
- Tailwind `dark:` 前缀配合 `class` 策略（非 `prefers-color-scheme` media）

### 2.5 键盘快捷键
| 按键 | 作用 |
|------|------|
| Ctrl+S | 触发一次立即保存（日常靠自动保存防抖） |

---

## 3. 数据流

### 3.1 自动保存
```
用户输入 → 停止输入 1 秒 → 写入 IndexedDB
```
- 单文档模型，只存一份草稿
- 使用 `idb` 轻量 Promise wrapper

### 3.2 打开文件
```
拖拽/选择 .md 文件 → 读取内容 → 覆盖编辑器 → 自动保存到 IndexedDB
```
- 不绑定原文件路径
- 修改后点"下载"导出，不写回原文件

### 3.3 渲染管线
```
编辑器内容 → 防抖 300ms → markdown-it 渲染 → 插入预览 DOM
```
- KaTeX：检测到 `$$` 或 `$` 分隔符时才 `import('katex')`
- 预览区 `<img>` 标签统一加 `loading="lazy"`
- 所有外部链接加 `rel="noopener noreferrer"`

---

## 4. Markdown 功能矩阵

### 4.1 markdown-it 插件栈
| 插件 | 功能 |
|------|------|
| `markdown-it` (内置) | 表格、删除线、链接、图片、代码块 |
| `markdown-it-task-lists` | 任务列表 `- [ ]` / `- [x]` |
| `markdown-it-emoji` | `:smile:` → 😄 |
| `markdown-it-anchor` | 标题锚点链接 |
| `markdown-it-footnote` | 脚注 `[^1]` |
| `markdown-it-sub` | 下标 `~subscript~` |
| `markdown-it-sup` | 上标 `^superscript^` |
| `markdown-it-deflist` | 定义列表 |
| `markdown-it-abbr` | 缩写 `<abbr>` |
| `markdown-it-ins` | 插入 `<ins>` |
| `markdown-it-mark` | 标记 `<mark>` |
| `@iktakahiro/markdown-it-katex` | 数学公式 `$...$` / `$$...$$` |
| Prism.js 回调 | 代码块语法高亮 |

### 4.2 安全
- `markdown-it` 配置 `html: false`（原始 HTML 转义显示）
- 不引入 DOMPurify（无后台 + 无用户系统 + 关闭 HTML 标签已足够）

---

## 5. PWA 设计

### 5.1 Manifest
- `display: standalone`
- `theme_color` 跟随当前主题
- `background_color: #ffffff`
- 图标：SVG 占位图标，生成 192×192 / 512×512

### 5.2 Service Worker（Workbox）
- **策略**：Cache First（所有静态资源）
- **预缓存**：Vite 构建产物自动注入 `self.__WB_MANIFEST`
- **版本更新**：检测到新 SW → 弹提示"有新版本可用"→ 用户点击刷新
- **离线感知**：无提示（除版本更新外，所有功能不依赖网络）

---

## 6. 错误处理

| 场景 | 行为 |
|------|------|
| IndexedDB 写入失败 | Toast："保存失败，请检查存储空间" |
| 文件读取失败 | Toast："无法读取文件，请检查文件格式" |
| KaTeX 加载失败 | 公式源码回退显示 |
| 渲染异常 | 预览区显示错误信息 + 原文 |
| SW 注册失败 | 静默，应用仍正常使用 |

---

## 7. 项目结构

```
md-viewer/
├── public/
│   └── icons/                  # PWA 图标（占位）
├── src/
│   ├── editor/
│   │   ├── editor.js           # CodeMirror 5 初始化、配置
│   │   └── shortcuts.js        # Ctrl+S 等键盘绑定
│   ├── preview/
│   │   ├── preview.js          # 预览区 DOM 操作
│   │   ├── renderer.js         # markdown-it 实例 + 插件配置
│   │   └── katex-loader.js     # KaTeX 按需动态加载
│   ├── storage/
│   │   ├── db.js               # IndexedDB 初始化、迁移
│   │   └── auto-save.js        # 防抖自动保存逻辑
│   ├── theme/
│   │   ├── theme.js            # 主题切换逻辑
│   │   └── theme-prevent-fouc.js # <head> 阻塞脚本（内联用）
│   ├── pwa/
│   │   └── update-notify.js    # SW 版本检测 + 更新提示
│   ├── layout/
│   │   ├── layout.js           # 布局模式切换（单/双栏）
│   │   └── responsive.js       # 断点监听
│   ├── export/
│   │   └── export.js           # 下载 .md / 导出 HTML
│   ├── file/
│   │   └── file-reader.js      # 拖拽 + input 文件读取
│   ├── ui/
│   │   ├── toast.js            # Toast 提示组件
│   │   └── toolbar.js          # 工具栏按钮组
│   ├── main.js                 # 入口：组装所有模块
│   └── style.css               # Tailwind 入口 + 自定义变量
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── PLAN.md                     # 本文件
```

---

## 8. 实施阶段

### Phase 1：骨架
1. Vite + Tailwind + `index.html` 搭建
2. 响应式布局（单栏 / 双栏切换）
3. 主题三态切换 + 防闪屏

### Phase 2：编辑器 + 预览
4. CodeMirror 5 集成
5. markdown-it 全插件栈 + Prism.js
6. 防抖渲染管线

### Phase 3：数据
7. IndexedDB 自动保存
8. 文件拖拽/打开
9. 导出 .md / HTML

### Phase 4：PWA
10. `vite-plugin-pwa` + Workbox 集成
11. `manifest.json`
12. 版本更新通知

### Phase 5：打磨
13. Toast 错误提示
14. Ctrl+S 快捷键
15. KaTeX 按需加载
16. 占位图标

---

## 9. 边界约束

| 约束 | 值 |
|------|-----|
| 浏览器兼容 | Chrome/Firefox/Safari/Edge 最近 2 版 + Safari iOS 14+ |
| 首屏加载 | 所有静态资源（除 KaTeX 按需）预缓存 |
| HTTPS 要求 | PWA 必须 HTTPS，部署平台（GH Pages / Vercel 等）自带 |
| 无运行时依赖 | 构建期抹平，产出一组纯静态文件 |

---

*Plan generated 2026-06-26 via /grill-me.*
