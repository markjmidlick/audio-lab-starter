import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("top and persistent player expose the same accessible article actions", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");
  for (const action of ["back", "copy-url", "remove"]) assert.equal((html.match(new RegExp(`data-article-action="${action}"`, "g")) || []).length, 2);
  assert.match(html, /Back to Library/); assert.match(html, /Copy source URL/); assert.match(html, /Remove Article/);
  assert.match(script, /window\.confirm\("Remove this article from Active\?/);
  assert.match(script, /player\.pause\(\)/);
  assert.match(styles, /\.persistent-player\{position:fixed/);
  assert.match(styles, /@media\(max-width:560px\)[\s\S]*min-height:44px/);
});
