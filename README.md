# Audio Lab Starter

A sanitized, local-first starter for turning articles or long messages into a private listening library. It preserves the core Audio Lab flow without Mark's production data, private infrastructure, or credentials.

The included app is deliberately small but runnable: it accepts source text, creates a durable queued article, generates unmistakably synthetic WAV fixture audio, displays a local library, and validates source receipts and retrieval. Hand it to an AI coding agent to add Kokoro, background recovery, and a private phone reader for your own environment.

## Quick start

Requirements: Node.js 20 or newer. No cloud account or model download is needed for the validation path.

```bash
git clone https://github.com/YOUR_GITHUB_USER/audio-lab-starter.git
cd audio-lab-starter
npm test
npm run validate
npm run bootstrap
npm start
```

Open `http://127.0.0.1:4188`. The generated tone is a fixture, not speech. It proves the queue, artifact, player, and security boundaries before an agent installs a local TTS engine.

## Build your version with an agent

Read [the agent implementation brief](docs/AGENT_IMPLEMENTATION_BRIEF.md), then give it and this repository to your agent. The agent should keep the current interfaces, replace the TTS adapter with Kokoro, and validate one synthetic item before it sees private content.

## Repository map

- `src/`: local API, durable store, text processing, and replaceable TTS adapter.
- `public/`: minimal local library and player.
- The reader duplicates Back to Library, Copy source URL, and recoverable Remove Article controls in its persistent player for long follow-along transcripts.
- `fixtures/`: generic synthetic source only.
- `scripts/validate.mjs`: small end-to-end canary.
- `scripts/audit-public.mjs`: tracked-file privacy check.
- `docs/ARCHITECTURE.md`: data flow, components, and interfaces.
- `docs/AGENT_IMPLEMENTATION_BRIEF.md`: ordered build brief and acceptance criteria.
- `docs/SECURITY.md`: local/cloud trust boundaries.
- `deployment/cloudflare/`: placeholders and a private-reader deployment design, not live configuration.

## What this repository intentionally excludes

- credentials, tokens, account IDs, emails, hostnames, bucket names, audience tags, and private endpoints;
- Mark's private articles, audio, library, listening history, logs, screenshots, and runtime data;
- personal Email Router rules, Gmail data, message IDs, or task-system metadata;
- production Cloudflare configuration or a link to Mark's deployment;
- model weights, generated production audio, and copied proprietary/user content.

## Public-audit gate

Before pushing a fork publicly:

```bash
npm run audit:public
git ls-files
git log --stat --oneline
```

This repository is a starting architecture, not a hosted service and not a claim of zero operating cost. See [security boundaries](docs/SECURITY.md) before enabling remote access.
