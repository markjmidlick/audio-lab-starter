# Architecture

```text
approved source or paste
          |
          v
source receipt + deduplication -> durable local article + queued job
                                         |
                                         v
                              text cleanup and chunking
                                         |
                                         v
                               local TTS adapter (Kokoro)
                                         |
                                         v
                         audio + timing + source + progress
                                         |
                   +---------------------+--------------------+
                   |                                          |
             local web reader                    optional private publisher
                                                              |
                                                              v
                                                authenticated phone/PWA reader
```

## Components and interfaces

- `POST /api/articles`: manual or agent-approved source intake.
- `POST /api/route`: automated intake with a source-content receipt. The normalized character count and SHA-256 must match; summaries are rejected as article bodies.
- `POST /api/articles/:id/generate`: TTS boundary. The starter generates unmistakably synthetic tone audio so validation works without a model download.
- `GET /api/articles`: local durable library.
- `GET /audio/:id.wav`: generated local audio.
- `PATCH /api/articles/:id/progress`: listening state.
- `src/tts.mjs`: replace the fixture adapter with Kokoro or another local engine. Keep its input/output contract.
- `deployment/cloudflare/`: optional private delivery boundary. It intentionally contains no live account metadata.

The starter uses a small atomic JSON store to make the architecture inspectable. A larger instance can replace it with SQLite while retaining the same state machine: `queued -> generating -> generated -> listening -> listened`, with explicit `failed` and recoverable `archived` states.
