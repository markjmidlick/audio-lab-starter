# Security and privacy boundaries

- Loopback is the default. Binding to `0.0.0.0`, a LAN, mesh VPN, or public host is a separate decision.
- Treat article titles, URLs, sender details, source text, audio, timing, and listening progress as private.
- Do not accept automated summaries as source content. Preserve the normalized source and verify its receipt before queueing.
- Keep model execution and original audio local unless the owner explicitly approves another boundary.
- Never expose a local TTS service directly to the public internet.
- Use authentication in front of every remote reader/API route; an unlisted URL is not access control.
- Keep storage private, previews empty, and publisher credentials out of application code and GitHub.
- Scrub metadata from compressed audio before remote upload.
- Make upload/commit idempotent and content-addressed. Set conservative file and storage ceilings.
- Use exact-key, recoverable deletion. Avoid wildcard or recursive cloud deletion.
- Start every deployment test with the synthetic fixture in this repository.

Before publishing a fork, run `npm run audit:public`, inspect `git ls-files`, and scan the complete Git history—not only the working tree.
