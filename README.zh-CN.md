<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/.github/logotype-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="/.github/logotype-light.png">
    <img src="/.github/logotype-dark.png" width="400" alt="Happy">
  </picture>
</div>

<h1 align="center">Happy Server 自托管版</h1>

<h4 align="center">
面向 Claude Code 和 Codex 客户端的自托管 Happy Server，支持端对端加密同步。
</h4>

<div align="center">

[📱 **iOS App**](https://apps.apple.com/us/app/happy-claude-code-client/id6748571505) • [🤖 **Android App**](https://play.google.com/store/apps/details?id=com.ex3ndr.happy) • [🌐 **网页版**](https://app.happy.engineering) • [📚 **文档**](https://happy.engineering/docs/) • [💬 **Discord**](https://discord.gg/fX9WBAhyfD)

**[English](./README.md)**

</div>

## 这个仓库是什么

本社区仓库跟踪 [slopus/happy](https://github.com/slopus/happy/tree/main/packages/happy-server) 上游最新的 `packages/happy-server`，并额外提供便于自托管的 Docker 打包。

当前同步的上游服务包为 `happy-server-self-host`，版本 `1.1.11`。它包含独立 PGlite 运行时、附件上传 API、语音用量接口、基于 Socket.IO rooms 的事件路由，以及上游 monorepo 中的 server package 入口文件。

## Docker 快速启动

1. 克隆仓库并准备配置：

```bash
git clone https://github.com/masfrank/happy-server.git
cd happy-server
cp .env.example .env
```

2. 生成 `HANDY_MASTER_SECRET`，写入 `.env`：

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

3. 启动服务：

```bash
docker compose up -d --build
```

默认访问地址为 `http://localhost:3005`。

## 运行方式

Docker 镜像使用当前上游的 standalone 流程：

- `sources/standalone.ts migrate` 将 Prisma migrations 应用到 PGlite。
- `sources/standalone.ts serve` 启动 Fastify API 与 Socket.IO 服务。
- 数据保存在 Docker volume `happy_data` 的 `/data` 目录下。
- 文件上传默认使用本地文件系统存储。
- 默认 Docker Compose 不需要 Redis、Postgres 或 S3。

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `HANDY_MASTER_SECRET` | 是 | - | 认证和加密主密钥，只生成一次并保持稳定。 |
| `PUBLIC_URL` | 否 | `http://localhost:3005` | 生成文件 URL 时使用的公开基础地址。 |
| `PORT` | 否 | `3005` | 容器内 HTTP 端口。 |
| `HOST` | 否 | `0.0.0.0` | 容器内监听地址。 |
| `DATA_DIR` | 否 | `/data` | 数据根目录。 |
| `PGLITE_DIR` | 否 | `/data/pglite` | PGlite 数据库目录。 |
| `ELEVENLABS_API_KEY` | 否 | - | 启用 ElevenLabs 语音会话凭证。 |
| `REVENUECAT_API_KEY` | 否 | - | 启用语音额度的订阅校验。 |

完整模板见 [`.env.example`](.env.example)。

## 镜像说明

本仓库保持 server 源码与上游一致，但 Docker 针对独立仓库布局做了适配：

- 使用 Yarn v1，因为本仓库保留独立的 `yarn.lock`。
- 将匹配上游的 `@slopus/happy-wire` 源码 vendored 为本地 file dependency，解决离开上游 pnpm workspace 后 `workspace:*` 无法解析的问题。
- 容器内通过 `tsx` 启动 standalone 入口，不依赖上游 monorepo 的 pnpm 构建流水线；为了独立 Docker 镜像能在 production install 后启动，`tsx` 被保留为运行时依赖。

本地构建：

```bash
docker build -t happy-server .
```

拉取社区镜像：

```bash
docker pull masfrank/happy-server:latest
```

## 上游

核心服务代码归 [slopus/happy](https://github.com/slopus/happy) 所有。本 fork 只维护独立 Docker 打包与自托管文档。
