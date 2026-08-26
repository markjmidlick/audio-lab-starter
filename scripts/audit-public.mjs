import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const forbiddenPaths = /(^|\/)(\.env|\.data|node_modules|\.wrangler|private|production)(\/|$)/i;
const forbiddenContent = [
  /CF-Access-Client-Secret\s*[:=]\s*(?!REPLACE|YOUR_)[^\s]+/i,
  /(?:api[_-]?key|token|client[_-]?secret)\s*[:=]\s*(?!(?:REPLACE|YOUR_|EXAMPLE))[A-Za-z0-9_\-]{16,}/i,
  /\/Users\//,
  /127\.0\.0\.1:3007/,
  /markjmidlick@gmail\.com/i,
  /thoughtofwaves@gmail\.com/i
];
const findings = [];
for (const file of files) {
  if (forbiddenPaths.test(file)) findings.push(`${file}: forbidden path`);
  const text = await readFile(file, "utf8").catch(() => null);
  if (text !== null) for (const pattern of forbiddenContent) if (pattern.test(text)) findings.push(`${file}: matched ${pattern}`);
}
if (findings.length) { console.error(findings.join("\n")); process.exit(1); }
console.log(`Public audit passed for ${files.length} tracked files.`);
