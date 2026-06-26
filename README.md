# MD Viewer

> 在浏览器里写 Markdown、实时预览、离线可用、安装即用。

一个移动端优先的 Markdown 编辑/预览网页工具，无需后端，支持 PWA 离线使用。

🔗 **在线体验**：<https://tim760255458.github.io/md-viewer/>

---

## ✨ 功能特性

### 编辑
- **CodeMirror 5** 编辑器：语法高亮、行号、自动续列表、括号匹配
- 拖拽 / 文件选择打开 `.md` `.markdown` `.txt`
- 下载 `.md` 文件
- 导出渲染后的完整 HTML 页面
- `Ctrl/Cmd + S` 手动保存

### 预览
- **markdown-it** 全插件栈
  - GFM 表格、删除线、任务列表 `- [x]`
  - Emoji `:smile:` → 😄
  - 脚注 `[^1]`、上下标 `~sub~` `^sup^`
  - 定义列表、缩写 `<abbr>`、`<ins>` `<mark>`
  - 标题锚点
- **Prism.js** 代码高亮：JavaScript / TypeScript / Python / Go / Rust / Java / C / C++ / C# / SQL / YAML / Bash / PowerShell / JSON / CSS / JSX / TSX / Markdown / XML 等 18 种语言
- **KaTeX** 数学公式：行内 `$...$`、块级 `$$...$$`（CSS 按需加载）
- 图片懒加载、外链自动 `rel="noopener noreferrer"`

### 体验
- 📱 **移动端优先**：小屏单栏切换，大屏双栏并排
- 🌓 **三态主题**：亮色 → 暗色 → 自动（跟随系统），防闪屏
- 💾 **自动保存**：IndexedDB 持久化，1 秒防抖
- 🔌 **PWA**：离线可用，可安装到桌面/主屏，新版本自动提示
- 🚫 **零后端**：构建产物是一组纯静态文件

## 🛠 技术栈

| 层 | 选型 |
|----|------|
| 构建 | Vite 6 |
| UI | 纯原生 JS（零运行时框架） |
| 样式 | Tailwind CSS 3 |
| 编辑器 | CodeMirror 5 |
| Markdown 渲染 | markdown-it（全插件栈） |
| 代码高亮 | Prism.js |
| 数学公式 | KaTeX |
| PWA | vite-plugin-pwa / Workbox |
| 持久化 | IndexedDB（idb wrapper） |

## 📦 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 🚀 部署

### GitHub Pages（已配置）

推送到 `main` 分支会自动触发 GitHub Actions 构建并部署：

- 在线地址：<https://tim760255458.github.io/md-viewer/>
- 工作流配置：[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### 其他平台

构建产物在 `dist/` 目录，可部署到任何静态托管：

```bash
npm run build
# 把 dist/ 上传到 Vercel / Netlify / Cloudflare Pages / 你的服务器
```

部署到非根路径时，设置环境变量 `GITHUB_PAGES_BASE` 为子路径前缀（如 `/my-app/`）。

## 📐 项目结构

```
md-viewer/
├── public/
│   ├── icons/              # PWA 图标
│   └── favicon.svg
├── src/
│   ├── editor/             # CodeMirror 编辑器
│   ├── preview/            # markdown-it 渲染 + KaTeX 按需加载
│   ├── storage/            # IndexedDB 自动保存
│   ├── theme/              # 三态主题 + 防闪屏
│   ├── pwa/                # Service Worker 更新通知
│   ├── layout/             # 响应式布局（单栏/双栏）
│   ├── export/             # 下载 .md / 导出 HTML
│   ├── file/               # 拖拽 + 文件选择
│   ├── ui/                 # 工具栏 + Toast
│   ├── main.js             # 入口
│   └── style.css           # Tailwind + 自定义样式
├── .github/workflows/      # GitHub Actions 部署
├── index.html
├── vite.config.js
└── package.json
```

## 🔒 安全

- `markdown-it` 配置 `html: false`，原始 HTML 标签会被转义显示
- 不引入 DOMPurify（无后台 + 无用户系统 + 关闭 HTML 已足够）
- 外链自动添加 `rel="noopener noreferrer" target="_blank"`

## 📋 设计原则

- **单文档模型**：只存一份草稿，够用就好
- **移动端优先**：小屏体验是第一优先级
- **按需加载**：KaTeX CSS 仅在检测到公式时才加载
- **零运行时框架**：构建期抹平，产出纯静态文件

## 📝 License

MIT
