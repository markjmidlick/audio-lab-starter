import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createAudioLab } from "../src/app.mjs";
import { sha256 } from "../src/hash.mjs";

const dataDir = await mkdtemp(join(tmpdir(), "audio-lab-starter-"));
const app = createAudioLab({ dataDir, publicDir: resolve("public") });
await new Promise((resolveListen) => app.server.listen(0, "127.0.0.1", resolveListen));
const { port } = app.server.address(); const base = `http://127.0.0.1:${port}`;
try {
  assert.equal((await fetch(`${base}/healthz`)).status, 200);
  const sourceText = "Synthetic validation text. It contains no private source material.";
  const payload = { title: "Validation fixture", sourceText, sourceKind: "source-content", sourceFidelity: "synthetic-or-user-approved-source", sourceCharCount: sourceText.length, sourceSha256: sha256(sourceText) };
  const routed = await fetch(`${base}/api/route`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  assert.equal(routed.status, 202); const { article } = await routed.json();
  const generated = await fetch(`${base}/api/articles/${article.id}/generate`, { method: "POST" }); assert.equal(generated.status, 200);
  const audio = await fetch(`${base}/audio/${article.id}.wav`); assert.equal(audio.status, 200); assert.match(audio.headers.get("content-type"), /audio\/wav/); assert.ok((await audio.arrayBuffer()).byteLength > 44);
  console.log("Validation passed: health, source receipt, queue, fixture audio, and retrieval.");
} finally { await new Promise((resolveClose) => app.server.close(resolveClose)); await rm(dataDir, { recursive: true, force: true }); }
