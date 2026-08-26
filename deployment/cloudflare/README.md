# Optional private Cloudflare reader boundary

This directory is a configuration template, not a deployment. Do not put account IDs, bucket IDs, hostnames, Access audience tags, service tokens, or real content in Git.

Recommended boundary:

1. Generate narration on the trusted local machine.
2. Stage only compressed audio plus the source, narration, timing, and content-addressed manifest for explicitly selected items.
3. Keep the R2 bucket private; disable public bucket URLs.
4. Put Cloudflare Access in front of every reader and API route.
5. Give the publisher a separate service-token policy scoped only to its upload API.
6. Reject preview and unexpected hostnames in the application.
7. Use an empty preview bucket and test with synthetic content first.
8. Store credentials in a local secret manager, not `.env`, GitHub, browser JavaScript, logs, or manifests.

An implementing agent should build an idempotent stage/upload/commit protocol. Upload immutable objects first; expose an article in the catalog only after every required object passes size and SHA-256 verification. Provide exact-key unpublish and recoverable tombstones. Never implement wildcard deletion.
