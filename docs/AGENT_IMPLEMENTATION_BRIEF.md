# Agent implementation brief

Give this repository to a coding agent with the following instruction:

> Build my private article-to-audio system from this starter. Preserve source text and provenance, keep generation local by default, and ask before deploying or transmitting content. First run the validation path unchanged. Then replace only the synthetic TTS adapter with a locally supported Kokoro integration, add durable background job recovery, and demonstrate one synthetic article end to end. Do not ingest personal data or deploy until I approve the exact configuration and security boundary.

## Implementation order

1. Run `npm test && npm run validate && npm run audit:public`.
2. Confirm local hardware, operating system, Python, audio tools, and preferred Kokoro package. Do not assume a Mac or 128 GB of RAM.
3. Implement a Kokoro adapter behind the existing `generateFixtureAudio` contract or rename it to a generic `generateAudio` interface.
4. Generate chunks serially, concatenate them, and retain timing per chunk. Keep original source text separate from cleaned narration text.
5. Make generation jobs recover after restart and idempotently reuse already generated items.
6. Add UI states for queue, failure, retry, reader, progress, and archive/restore.
   Keep article actions available in both the reader header and persistent player, sharing one implementation rather than duplicating behavior.
7. Validate entirely on loopback with synthetic content.
8. Only if the owner asks for phone access, choose a private network or authenticated cloud reader and review `docs/SECURITY.md` first.

## Acceptance criteria

- A mismatched source receipt returns `422` without saving an article.
- Repeating the same normalized source and canonical URL reuses the article.
- A queued job survives restart in the durable store.
- Generated audio is retrievable and sections have monotonic timing.
- Original source and narration text remain distinct artifacts.
- No private content or service credential is present in Git, logs, fixtures, or browser code.
- Header and persistent-player controls are keyboard accessible, at least 44px tall at narrow mobile widths, and do not remount the audio element while reading or following text.
