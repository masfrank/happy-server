<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/.github/logotype-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="/.github/logotype-light.png">
    <img src="/.github/logotype-dark.png" width="400" alt="Happy">
  </picture>
</div>

<h1 align="center">Happy Server Self-Host</h1>

<h4 align="center">
Self-hosted Happy Server for Claude Code and Codex clients, with end-to-end encrypted sync.
</h4>

<div align="center">

[📱 **iOS App**](https://apps.apple.com/us/app/happy-claude-code-client/id6748571505) • [🤖 **Android App**](https://play.google.com/store/apps/details?id=com.ex3ndr.happy) • [🌐 **Web App**](https://app.happy.engineering) • [📚 **Docs**](https://happy.engineering/docs/) • [💬 **Discord**](https://discord.gg/fX9WBAhyfD)

**[中文说明](./README.zh-CN.md)**

</div>

## What This Repository Is

This community repository tracks the latest upstream `packages/happy-server` from [slopus/happy](https://github.com/slopus/happy/tree/main/packages/happy-server) and adds Docker packaging for easier self-hosting.

The current upstream server package is `happy-server-self-host` version `1.1.11`. It includes the standalone PGlite runtime, attachment upload APIs, voice usage endpoints, Socket.IO room-based event routing, and the package entrypoints from the monorepo server package.

## Docker Quick Start

1. Clone and configure:

```bash
git clone https://github.com/masfrank/happy-server.git
cd happy-server
cp .env.example .env
```

2. Generate `HANDY_MASTER_SECRET` and put it in `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

3. Start the server:

```bash
docker compose up -d --build
```

The API listens on `http://localhost:3005` by default.

## Runtime Model

The Docker image runs the current standalone server flow:

- `sources/standalone.ts migrate` applies Prisma migrations into PGlite.
- `sources/standalone.ts serve` starts the Fastify API and Socket.IO server.
- Data is stored under `/data` in the `happy_data` Docker volume.
- File uploads use local filesystem storage by default.
- Redis, Postgres, and S3 are not required for the default Docker Compose setup.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HANDY_MASTER_SECRET` | Yes | - | Master secret for auth/encryption. Generate once and keep it stable. |
| `PUBLIC_URL` | No | `http://localhost:3005` | Public base URL used for generated file URLs. |
| `PORT` | No | `3005` | HTTP port inside the container. |
| `HOST` | No | `0.0.0.0` | Bind host inside the container. |
| `DATA_DIR` | No | `/data` | Base data directory. |
| `PGLITE_DIR` | No | `/data/pglite` | PGlite database directory. |
| `ELEVENLABS_API_KEY` | No | - | Enables ElevenLabs voice conversation credentials. |
| `REVENUECAT_API_KEY` | No | - | Enables subscription checks for voice limits. |

See [`.env.example`](.env.example) for the Compose-ready template.

## Image Notes

This repository keeps the server source aligned with upstream, but Docker is adapted for this standalone repository layout:

- Uses Yarn v1 because this repo keeps a standalone `yarn.lock`.
- Vendors the matching upstream `@slopus/happy-wire` source as a local file dependency so the monorepo `workspace:*` dependency resolves outside the upstream pnpm workspace.
- Runs through `tsx` in the container instead of relying on the upstream monorepo pnpm build pipeline; `tsx` is installed as a runtime dependency for this standalone Docker image.

Build locally:

```bash
docker build -t happy-server .
```

Pull the community image:

```bash
docker pull masfrank/happy-server:latest
```

## Upstream

Core server code belongs to [slopus/happy](https://github.com/slopus/happy). This fork only adds standalone Docker packaging and related documentation for self-hosting.
