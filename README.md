# ReviewBot 🤖

**AI-powered code review agent for GitHub.** Automatically reviews every pull request — security, bugs, and code quality — using three specialized AI agents running in parallel.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## How It Works

```
GitHub PR opened/sync
        │  Webhook
        ▼
  ┌─────────────────┐
  │   Security      │──► SQL injection, XSS, secrets, auth
  │   Agent         │
  ├─────────────────┤
  │   Bug Risk      │──► Null pointers, race conditions, logic errors
  │   Agent         │
  ├─────────────────┤
  │   Quality       │──► Performance, style, complexity, best practices
  │   Agent         │
  └────────┬────────┘
           │  parallel
           ▼
  ┌─────────────────┐
  │   Aggregator    │──► Merge, deduplicate, sort by severity
  └────────┬────────┘
           │
           ▼
  GitHub PR ←─ Inline comments + summary + severity badge
```

## Features

- **Zero configuration** — Install the GitHub App, open a PR, get a review
- **3 parallel AI agents** — Security, bugs, and quality analyzed simultaneously
- **Structured output** — Severity ratings, file references, code-level suggestions
- **Inline PR comments** — Findings posted directly on the diff lines
- **Free AI inference** — Powered by Groq (Llama 3.3 70B), no API costs
- **Usage metering** — Free tier (5 reviews/mo), Pro (unlimited), Enterprise (team)
- **Dashboard** — Review history, usage stats, connected repositories
- **SQLite** — Zero-infrastructure database, works everywhere

## Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) 22+
- A [GitHub App](https://docs.github.com/en/apps/creating-github-apps) with:
  - Pull requests: Read & Write
  - Contents: Read
  - Checks: Read & Write
  - Subscribed to `pull_request` events
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for user login
- A [Groq API key](https://console.groq.com) (free tier)

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in your credentials:

```env
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GROQ_API_KEY=gsk_your_groq_api_key
APP_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
SESSION_SECRET=generate_a_random_64_char_secret
```

### 3. Install & Run

```bash
npm install
npx prisma db push
npm run dev
```

### 4. Expose Webhook (Development)

```bash
npx ngrok http 3000
```

Set your GitHub App webhook URL to `https://your-ngrok.ngrok.io/api/webhook/github`.

### 5. Open a PR

Install the app on a repo, open a pull request — ReviewBot posts a review automatically.

## Deployment

### Railway (recommended)

Push the repo, Railway auto-detects the `Dockerfile`:

```bash
git push railway main
```

Set all environment variables in Railway dashboard. The `railway.toml` handles health checks and restart policy.

### Docker

```bash
docker build -t reviewbot .
docker run -p 3000:3000 --env-file .env reviewbot
```

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/webhook/github` | POST | GitHub App webhook receiver |
| `/api/auth/login` | GET | GitHub OAuth login redirect |
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/logout` | GET | Clear session |
| `/api/user` | GET | Current user & usage |
| `/api/reviews` | GET | List reviews (optional `?repo=`) |
| `/api/reviews/[id]` | GET | Single review detail |
| `/api/dashboard/repos` | GET | Connected repositories |
| `/api/health` | GET | Health check |

## Architecture

```
Frontend (Next.js)
    │
    ▼
API Routes (Next.js)
    │
    ├── Auth (jose JWT + cookies)
    ├── GitHub App (Octokit)
    └── AI (Groq SDK)
         │
         ├── Security Agent
         ├── Bug Risk Agent
         └── Quality Agent
              │
              ▼
         Aggregator
              │
              ▼
         GitHub PR Comments
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | SQLite via Prisma |
| Auth | jose (JWT) + GitHub OAuth |
| GitHub | @octokit/app + @octokit/rest |
| AI | Groq SDK (Llama 3.3 70B) |
| Styling | Tailwind CSS v4 |
| Deploy | Docker / Railway |

## Pricing

| Tier | Price | Reviews |
|---|---|---|
| Free | $0 | 5/month |
| Pro | $29/mo | Unlimited |
| Enterprise | $99/mo | Unlimited + Team seats |

## License

MIT
