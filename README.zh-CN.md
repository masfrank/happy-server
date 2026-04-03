<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/.github/logotype-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="/.github/logotype-light.png">
    <img src="/.github/logotype-dark.png" width="400" alt="Happy">
  </picture>
</div>

<h1 align="center">
  Claude Code & Codex 的移动端与网页客户端
</h1>

<h4 align="center">
随时随地使用 Claude Code 或 Codex，全程端对端加密。
</h4>

<div align="center">

[📱 **iOS App**](https://apps.apple.com/us/app/happy-claude-code-client/id6748571505) • [🤖 **Android App**](https://play.google.com/store/apps/details?id=com.ex3ndr.happy) • [🌐 **网页版**](https://app.happy.engineering) • [🎥 **演示视频**](https://youtu.be/GCS0OG9QMSE) • [📚 **文档**](https://happy.engineering/docs/) • [💬 **Discord**](https://discord.gg/fX9WBAhyfD)

**[English](./README.md)**

</div>

---

## 🐳 Docker 镜像（社区构建版）

> **本仓库为 [happy-server](https://github.com/slopus/happy/tree/main/packages/happy-server) 提供非官方 Docker 镜像。**  
> 上游项目 [slopus/happy](https://github.com/slopus/happy) 官方并未发布 happy-server 的 Docker 镜像，本仓库填补了这一空白。

### 快速启动

```bash
docker run -d \
  --name happy-server \
  -p 3005:3005 \
  -v happy-data:/data \
  -e SECRET_KEY=你的密钥 \
  masfrank/happy-server:latest
```

### Docker Compose

```yaml
version: "3.9"
services:
  happy-server:
    image: masfrank/happy-server:latest
    container_name: happy-server
    restart: unless-stopped
    ports:
      - "3005:3005"
    volumes:
      - happy-data:/data
    environment:
      - SECRET_KEY=你的密钥
      - NODE_ENV=production

volumes:
  happy-data:
```

### 可用标签

| 标签 | 说明 |
|------|------|
| `latest` | 最新稳定版，跟踪 upstream main 分支 |
| `sha-xxxxxxx` | 特定 commit 构建，用于固定版本 |

### 为什么我们的镜像更小？

上游 Dockerfile 使用 `node:20-slim`（基于 Debian）作为运行时底座。我们采用两段式方案大幅缩减体积：

| 阶段 | 基础镜像 | 作用 |
|------|---------|------|
| Builder | `node:20-alpine` | 编译 TypeScript、安装全量依赖 |
| Deps | `node:20-alpine` | 仅安装生产依赖，剔除开发包 |
| **Runner** | `frolvlad/alpine-glibc:alpine-3.19_glibc-2.34` | 最小化运行时，Alpine + glibc 兼容层 |

**Alpine vs Debian：** Alpine Linux 体积约 5 MB，而 Debian slim 约 75 MB。Alpine 使用 `musl` libc，某些 Node.js 原生插件需要 `glibc` 才能运行。我们通过引入 [`frolvlad/alpine-glibc`](https://github.com/nicowillis/alpine-glibc) 在 runner 阶段注入 glibc 兼容层，两全其美：镜像体积小，原生插件兼容性好。

### 本地构建

```bash
git clone https://github.com/masfrank/happy-server.git
cd happy-server
docker build -t happy-server .
```

---

## 什么是 Happy Coder？

在你的电脑上用 `happy claude` 代替 `claude`，或用 `happy codex` 代替 `codex` 来启动 AI。当你想用手机远程控制时，它会切换到远程模式；回到电脑时，按任意键即可切回本地控制。

## 🔥 为什么选择 Happy Coder？

- 📱 **移动端访问 Claude Code 和 Codex** — 离开桌面也能随时查看 AI 进度
- 🔔 **推送通知** — AI 需要确认操作或遇到错误时立即提醒你
- ⚡ **秒切设备** — 手机和电脑之间一键切换控制权
- 🔐 **端对端加密** — 你的代码离开设备前全程加密，服务器无法解密
- 🛠️ **完全开源** — 代码随时可审计，无遥测，无追踪

## 📦 项目组成

- **[Happy App](https://github.com/slopus/happy/tree/main/packages/happy-app)** — 网页 UI + 移动客户端（Expo）
- **[Happy CLI](https://github.com/slopus/happy/tree/main/packages/happy-cli)** — Claude Code 和 Codex 的命令行封装
- **[Happy Agent](https://github.com/slopus/happy/tree/main/packages/happy-agent)** — 远程 Agent 控制 CLI
- **[Happy Server](https://github.com/slopus/happy/tree/main/packages/happy-server)** — 加密同步后端服务

---

## 许可证

MIT License — 详见 [LICENSE](LICENSE)。

---

*本仓库是追踪 [slopus/happy](https://github.com/slopus/happy) 的社区 fork，专注于提供 Docker 镜像构建。所有核心功能和知识产权归原作者所有，感谢 [slopus/happy](https://github.com/slopus/happy) 项目的开源贡献。*
