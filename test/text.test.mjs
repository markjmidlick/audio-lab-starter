import test from "node:test";
import assert from "node:assert/strict";
import { cleanNarrationText, normalizeSourceText, splitText } from "../src/text.mjs";
test("normalizes and preserves readable link labels", () => { assert.equal(normalizeSourceText("a\r\n b "), "a\n b"); assert.equal(cleanNarrationText("Read [the note](https://example.com/x)."), "Read the note."); });
test("splits long narration into ordered sections", () => { const chunks=splitText("One sentence. Two sentence. Three sentence.", 20); assert.ok(chunks.length >= 2); assert.equal(chunks[0].index, 1); });
