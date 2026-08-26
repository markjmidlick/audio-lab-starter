import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { createStore } from "./store.mjs";
import { sha256, stableId } from "./hash.mjs";
import { normalizeSourceText, splitText } from "./text.mjs";
import { generateFixtureAudio } from "./tts.mjs";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".wav": "audio/wav" };
const json = (response, status, value) => { response.writeHead(status, { "content-type": "application/json; charset=utf-8" }); response.end(JSON.stringify(value)); };

async function body(request) {
  let value = "";
  for await (const chunk of request) {
    value += chunk;
    if (value.length > 1_000_000) throw Object.assign(new Error("Request too large"), { statusCode: 413 });
  }
  return value ? JSON.parse(value) : {};
}

export function createAudioLab({ dataDir = ".data", publicDir = "public", maxTextChars = 40000 } = {}) {
  const store = createStore(dataDir);

  async function saveArticle(payload, routed = false) {
    const sourceText = normalizeSourceText(payload.sourceText ?? payload.text);
    if (!sourceText) throw Object.assign(new Error("sourceText is required"), { statusCode: 400 });
    if (sourceText.length > maxTextChars) throw Object.assign(new Error("sourceText is too long"), { statusCode: 413 });
    if (routed) {
      if (payload.sourceKind !== "source-content" || payload.sourceFidelity !== "synthetic-or-user-approved-source") {
        throw Object.assign(new Error("Routed items require a source-content fidelity receipt"), { statusCode: 422 });
      }
      if (Number(payload.sourceCharCount) !== sourceText.length || payload.sourceSha256 !== sha256(sourceText)) {
        throw Object.assign(new Error("Source receipt does not match sourceText"), { statusCode: 422 });
      }
    }
    const library = await store.read();
    const fingerprint = sha256(`${payload.canonicalUrl ?? ""}\n${sourceText}`);
    const existing = library.articles.find((item) => item.fingerprint === fingerprint);
    if (existing) return { article: existing, reused: true };
    const now = new Date().toISOString();
    const article = {
      id: stableId("article"), title: String(payload.title || "Untitled article").slice(0, 240),
      author: String(payload.author || "").slice(0, 160), canonicalUrl: payload.canonicalUrl || null,
      sourceText, fingerprint, sourceReceipt: routed ? { sourceKind: payload.sourceKind, sourceFidelity: payload.sourceFidelity, sourceCharCount: sourceText.length, sourceSha256: sha256(sourceText) } : null,
      status: "queued", progressSeconds: 0, createdAt: now, updatedAt: now
    };
    library.articles.unshift(article);
    library.jobs.unshift({ id: stableId("job"), articleId: article.id, status: "queued", createdAt: now });
    await store.write(library);
    return { article, reused: false };
  }

  async function generate(articleId) {
    const library = await store.read();
    const article = library.articles.find((item) => item.id === articleId);
    if (!article) throw Object.assign(new Error("Article not found"), { statusCode: 404 });
    const job = library.jobs.find((item) => item.articleId === articleId && item.status === "queued");
    article.status = "generating"; if (job) job.status = "generating"; await store.write(library);
    const outputPath = join(dataDir, "audio", `${article.id}.wav`);
    const result = await generateFixtureAudio({ outputPath, chunks: splitText(article.sourceText) });
    article.status = "generated"; article.audioPath = outputPath; article.audioUrl = `/audio/${article.id}.wav`;
    article.generation = result; article.updatedAt = new Date().toISOString();
    if (job) { job.status = "generated"; job.completedAt = article.updatedAt; }
    await store.write(library);
    return article;
  }

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      if (request.method === "GET" && url.pathname === "/healthz") return json(response, 200, { ok: true, service: "audio-lab-starter" });
      if (request.method === "GET" && url.pathname === "/api/articles") return json(response, 200, (await store.read()).articles);
      if (request.method === "POST" && url.pathname === "/api/articles") { const saved = await saveArticle(await body(request)); return json(response, saved.reused ? 200 : 202, saved); }
      if (request.method === "POST" && url.pathname === "/api/route") { const saved = await saveArticle(await body(request), true); return json(response, saved.reused ? 200 : 202, saved); }
      const generateMatch = url.pathname.match(/^\/api\/articles\/([^/]+)\/generate$/);
      if (request.method === "POST" && generateMatch) return json(response, 200, await generate(decodeURIComponent(generateMatch[1])));
      const progressMatch = url.pathname.match(/^\/api\/articles\/([^/]+)\/progress$/);
      if (request.method === "PATCH" && progressMatch) {
        const library = await store.read(); const article = library.articles.find((item) => item.id === decodeURIComponent(progressMatch[1]));
        if (!article) throw Object.assign(new Error("Article not found"), { statusCode: 404 });
        const payload = await body(request); article.progressSeconds = Math.max(0, Number(payload.progressSeconds) || 0); article.status = payload.completed ? "listened" : "listening";
        await store.write(library); return json(response, 200, article);
      }
      const audioMatch = url.pathname.match(/^\/audio\/([^/]+)\.wav$/);
      if (request.method === "GET" && audioMatch) {
        const path = join(dataDir, "audio", `${decodeURIComponent(audioMatch[1])}.wav`); const audio = await readFile(path);
        response.writeHead(200, { "content-type": "audio/wav", "content-length": audio.length }); return response.end(audio);
      }
      if (request.method === "GET") {
        const relative = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\//, "");
        if (relative.includes("..")) return json(response, 400, { error: "Invalid path" });
        try { const value = await readFile(join(publicDir, relative)); response.writeHead(200, { "content-type": TYPES[extname(relative)] || "application/octet-stream" }); return response.end(value); }
        catch (error) { if (error.code !== "ENOENT") throw error; }
      }
      return json(response, 404, { error: "Not found" });
    } catch (error) { return json(response, error.statusCode || 500, { error: error.message }); }
  });
  return { server, store, saveArticle, generate };
}
