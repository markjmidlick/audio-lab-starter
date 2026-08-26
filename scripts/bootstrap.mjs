import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createAudioLab } from "../src/app.mjs";
import { normalizeSourceText } from "../src/text.mjs";
import { sha256 } from "../src/hash.mjs";

const fixturePath = resolve("fixtures/sample-route.json");
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
fixture.sourceText = normalizeSourceText(fixture.sourceText);
fixture.sourceCharCount = fixture.sourceText.length;
fixture.sourceSha256 = sha256(fixture.sourceText);
const app = createAudioLab({ dataDir: resolve(".data"), publicDir: resolve("public") });
const saved = await app.saveArticle(fixture, true);
const article = await app.generate(saved.article.id);
await writeFile(resolve(".data/bootstrap-receipt.json"), `${JSON.stringify({ articleId: article.id, status: article.status, fixture: true }, null, 2)}\n`);
console.log(`Bootstrapped ${article.id} (${article.status}). Run npm start.`);
