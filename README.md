<p align="center">
  <img src="apps/web/public/favicon-dark.svg" width="72" height="72" alt="WeMD Logo" />
</p>

<p align="center">
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-9+-F69220?logo=pnpm&logoColor=white&style=for-the-badge" alt="pnpm" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=0B1A26&style=for-the-badge" alt="React 18" /></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white&style=for-the-badge" alt="Electron" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-4CAF50?style=for-the-badge" alt="License: MIT" /></a>
</p>

# WeMD

专注于用 Markdown 优雅、高效地写微信公众号。可选择 Web 端或 Electron 桌面端。

双端共享同一套核心能力：真实文件夹工作区、浏览器离线模式、自动历史记录、主题/自定义 CSS、以及官方图床服务和第三方图床支持。


---

## 主要特性

- **写作体验**  
  现代编辑器与实时预览联动，提供字数/段落/阅读时长统计、多级标题导航与快捷键。

- **真实工作区 + 浏览器模式**  
  Web/Electron 支持直接打开本地文件夹；如不便授权，可切换到浏览器存储模式，所有草稿保存在当前浏览器中（仅在清除站点数据时删除）。

- **自动历史与多文章管理**  
  IndexedDB 中保存的快照支持多文档切换、版本恢复和安全的自动保存。

- **主题体系**  
  内置十余款主题，可为不同文章选择不同主题；提供自定义 CSS 模板，让你定制自己的主题。

- **一键复制到微信**  
  预览里的效果和公众号后台保持一致，点击“复制”后直接前往公众号粘贴即可。

- **多图床支持**  
  默认使用 WeMD 官方图床（由内置上传服务托管），也可切换七牛云 Kodo、阿里云 OSS、腾讯云 COS 等第三方图床。

- **桌面端**  
  支持 macOS 与 Windows 应用，提供与 Web 完全一致的体验，包含窗口管理、工作区记忆、文件系统监听等桌面特性。



## 技术栈

- **前端**：React 18、Vite、Zustand、CodeMirror 6、Markdown-it、Lucide、IndexedDB（idb）
- **桌面**：Electron 28、fs.watch、Electron Builder
- **上传服务**：NestJS 11、COS SDK
- **工程化**：pnpm 9、Turborepo、TypeScript、ESLint、Prettier

---

## 项目结构

```
WeMD
├── apps
│   ├── web         # React + Vite 前端
│   ├── electron    # Electron 主进程
│   └── server      # NestJS 上传服务
├── packages
│   └── core        # Markdown Parser / 主题 / 工具
├── scripts         # 辅助脚本
├── templates       # 主题与排版示例
└── turbo.json      # Turborepo 配置
```

---
## 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 9（推荐 `corepack enable pnpm`）

### 安装依赖

```bash
pnpm install
```

### 本地开发

| 场景 | 命令 | 说明 |
| --- | --- | --- |
| Web 端 | `pnpm dev:web` | 启动 Vite 开发服务器，默认 http://localhost:5173 |
| 上传服务 | `pnpm --filter @wemd/server dev` | 启动 NestJS 上传服务，供“官方图床”使用 |
| Electron + Web | `pnpm dev:desktop` | 先启动 Web，再等待端口就绪后启动 Electron |
| 所有 dev 脚本 | `pnpm dev` | 通过 Turbo 并行执行各包的 `dev` 任务 |

建议先启动上传服务，再启动 Web/Electron，以便图片上传功能可用。

### 构建

| 目标 | 命令 | 说明 |
| --- | --- | --- |
| Web 生产包 | `pnpm --filter @wemd/web build` | 输出到 `apps/web/dist` |
| Electron 应用 | `pnpm --filter wemd-electron run build:<platform>` | `<platform>` 可选 `mac`、`win`、`linux` |
| 上传服务 | `pnpm --filter @wemd/server build` | 生成 `apps/server/dist`，可配合 `start:prod` |
| 整体构建 | `pnpm build` | Turbo 递归构建所有包 |

### 常用脚本

```bash
pnpm lint           # Turbo 运行 lint
pnpm format         # Prettier 批量格式化
pnpm dev:electron   # 仅启动 Electron（需先运行 Web）
```

---
## 📁 存储模式

通过“文章存储位置”控件可以在两种模式之间切换：

1. **本地存储模式**：使用 File System Access API（Web）或 Electron 的 Node 能力直接读写工作区文件夹，支持自动监听/重命名/删除等操作。
2. **浏览器存储模式（仅 Web 端支持）**：文章与历史记录保存在 IndexedDB 中，关闭浏览器仍会保留，适合临时创作或没有本地权限的场景。

两种模式共享主题、历史记录和图床配置，切换后可立即生效。

> **提示（Chrome）**  
> 如果在 Chrome 中使用本地存储模式，需要先在 `chrome://flags/#file-system-access-api` 启用 File System Access API（通常默认开启）；若浏览器设置中禁用了“允许网站管理本地文件”，请重新授权工作区文件夹。

---

## CI/CD（Desktop）

- 仓库包含 `.github/workflows/build-electron.yml` 与 `release.yml`，当推送 `v*` Tag（如 `v1.2.3`）时会启动 GitHub Actions，在 macOS / Windows / Linux 上分别构建 Electron 应用并上传 Release 附件。
- 工作流使用 `GH_TOKEN` / `GITHUB_TOKEN` 处理签名与发布，请在仓库 Secrets 中配置相关凭证。
- 日常开发仍可本地执行 `pnpm --filter wemd-electron run build:<platform>`，CI 产出的构建可直接分发给用户。
