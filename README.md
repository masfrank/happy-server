<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/.github/logotype-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="/.github/logotype-light.png">
    <img src="/.github/logotype-dark.png" width="400" alt="Happy">
  </picture>
</div>

<h1 align="center">
  Mobile and Web Client for Claude Code & Codex
</h1>

<h4 align="center">
Use Claude Code or Codex from anywhere with end-to-end encryption.
</h4>

<div align="center">

[📱 **iOS App**](https://apps.apple.com/us/app/happy-claude-code-client/id6748571505) • [🤖 **Android App**](https://play.google.com/store/apps/details?id=com.ex3ndr.happy) • [🌐 **Web App**](https://app.happy.engineering) • [🎥 **See a Demo**](https://youtu.be/GCS0OG9QMSE) • [📚 **Documentation**](https://happy.engineering/docs/) • [💬 **Discord**](https://discord.gg/fX9WBAhyfD)

**[中文说明](./README.zh-CN.md)**

</div>

<img width="5178" height="2364" alt="github" src="/.github/header.png" />


<h3 align="center">
Step 1: Download App
</h3>

<div align="center">
<a href="https://apps.apple.com/us/app/happy-claude-code-client/id6748571505"><img width="135" height="39" alt="appstore" src="https://github.com/user-attachments/assets/45e31a11-cf6b-40a2-a083-6dc8d1f01291" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://play.google.com/store/apps/details?id=com.ex3ndr.happy"><img width="135" height="39" alt="googleplay" src="https://github.com/user-attachments/assets/acbba639-858f-4c74-85c7-92a4096efbf5" /></a>
</div>

<h3 align="center">
Step 2: Install CLI on your computer
</h3>

```bash
npm install -g happy
```

> Migrated from the `happy-coder` package. Thanks to [@franciscop](https://github.com/franciscop) for donating the `happy` package name!

<h3 align="center">
Step 3: Start using `happy` instead of `claude` or `codex`
</h3>

```bash
# Instead of claude, use:
happy claude
# or
happy codex
```

## How does it work?

On your computer, run `happy` instead of `claude` or `happy codex` instead of `codex` to start your AI through our wrapper. When you want to control your coding agent from your phone, it restarts the session in remote mode. To switch back to your computer, just press any key on your keyboard.

## 🔥 Why Happy Coder?

- 📱 **Mobile access to Claude Code and Codex** - Check what your AI is building while away from your desk
- 🔔 **Push notifications** - Get alerted when Claude Code and Codex needs permission or encounters errors  
- ⚡ **Switch devices instantly** - Take control from phone or desktop with one keypress
- 🔐 **End-to-end encrypted** - Your code never leaves your devices unencrypted
- 🛠️ **Open source** - Audit the code yourself. No telemetry, no tracking

## 📦 Project Components

- **[Happy App](https://github.com/slopus/happy/tree/main/packages/happy-app)** - Web UI + mobile client (Expo)
- **[Happy CLI](https://github.com/slopus/happy/tree/main/packages/happy-cli)** - Command-line interface for Claude Code and Codex
- **[Happy Agent](https://github.com/slopus/happy/tree/main/packages/happy-agent)** - Remote agent control CLI (create, send, monitor sessions)
- **[Happy Server](https://github.com/slopus/happy/tree/main/packages/happy-server)** - Backend server for encrypted sync

## 🏠 Who We Are

We're engineers scattered across Bay Area coffee shops and hacker houses, constantly checking how our AI coding agents are progressing on our pet projects during lunch breaks. Happy Coder was born from the frustration of not being able to peek at our AI coding tools building our side hustles while we're away from our keyboards. We believe the best tools come from scratching your own itch and sharing with the community.

## 📚 Documentation & Contributing

- **[Documentation Website](https://happy.engineering/docs/)** - Learn how to use Happy Coder effectively
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute, PR guidelines, and development setup
- **[Edit docs at github.com/slopus/slopus.github.io](https://github.com/slopus/slopus.github.io)** - Help improve our documentation and guides

## 🐳 Docker Image (Community Build)

> **This fork provides an unofficial Docker image for [happy-server](https://github.com/slopus/happy/tree/main/packages/happy-server).**  
> The upstream [slopus/happy](https://github.com/slopus/happy) project does not publish an official Docker image for the server component — this repository fills that gap.

### Quick start with Docker Compose

**1. Clone and configure**

```bash
git clone https://github.com/masfrank/happy-server.git
cd happy-server
cp .env.example .env
```

**2. Fill in `.env` — the only required secret is `HANDY_MASTER_SECRET`**

```bash
# Generate a secure secret (run once, keep it safe — changing it breaks all sessions)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Then edit `.env`:

```env
HANDY_MASTER_SECRET=<paste generated secret>
POSTGRES_PASSWORD=<choose a strong password>
DATABASE_URL=postgresql://happy:<same password>@postgres:5432/happy-server
```

**3. Start**

```bash
docker compose up -d
```

The server will be available at `http://localhost:3005`.

---

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HANDY_MASTER_SECRET` | ✅ | — | Master key for end-to-end encryption. Generate once, never rotate. |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection URL |
| `POSTGRES_DB` | ✅ | `happy-server` | Database name (used by the postgres service) |
| `POSTGRES_USER` | ✅ | `happy` | Database user |
| `POSTGRES_PASSWORD` | ✅ | — | Database password |
| `REDIS_URL` | — | — | Redis URL. Enables pub/sub clustering across instances. |
| `PORT` | — | `3005` | HTTP port the server listens on |
| `TZ` | — | `UTC` | Timezone (e.g. `Asia/Shanghai`) |
| `ELEVENLABS_API_KEY` | — | — | ElevenLabs voice API key |

See [`.env.example`](.env.example) for the full list including optional integrations.

---

### Available tags

| Tag | Description |
|-----|-------------|
| `latest` | Tracks upstream `main` branch |
| `sha-xxxxxxx` | Pinned to a specific commit |

```bash
docker pull masfrank/happy-server:latest
```

---

### Why is our image smaller?

The upstream Dockerfile uses `node:20-slim` (Debian-based) as the runtime base. Our build uses a 2-stage Alpine approach:

| Stage | Base image | Purpose |
|-------|-----------|---------|
| **Builder** | `node:20-alpine` | Install all deps (frozen lockfile) → type-check → prune dev deps in-place |
| **Runner** | `frolvlad/alpine-glibc:alpine-3.19_glibc-2.34` | Minimal Alpine + glibc shim, copy pruned artifacts from builder |

**Why not a separate `deps` stage?** yarn v1 rejects `--frozen-lockfile --production` together — the lockfile was generated with dev deps included, so yarn considers it stale and refuses to continue. Instead we install everything once with `--frozen-lockfile`, then prune dev packages in-place with `--production --prefer-offline`, which reuses the already-downloaded cache without touching the lockfile.

**Alpine vs Debian:** Alpine Linux is ~5 MB vs Debian slim's ~75 MB. Alpine uses `musl` libc, which breaks some native Node.js addons that expect `glibc`. We add a [`frolvlad/alpine-glibc`](https://github.com/nicowillis/alpine-glibc) shim to the runner stage — small image size with full native addon compatibility.

### Build locally

```bash
git clone https://github.com/masfrank/happy-server.git
cd happy-server
docker build -t happy-server .
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*This is a community fork that tracks [slopus/happy](https://github.com/slopus/happy) and adds Docker image builds. All core functionality and intellectual property belongs to the original authors.*
