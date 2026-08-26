import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { stableId } from "./hash.mjs";

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${stableId("tmp")}`;
  await writeFile(temporary, value);
  await rename(temporary, path);
}

export function createStore(dataDir) {
  const path = join(dataDir, "library.json");
  async function read() {
    try { return JSON.parse(await readFile(path, "utf8")); }
    catch (error) {
      if (error.code === "ENOENT") return { version: 1, articles: [], jobs: [] };
      throw error;
    }
  }
  async function write(library) {
    const next = { ...library, updatedAt: new Date().toISOString() };
    await writeAtomic(path, `${JSON.stringify(next, null, 2)}\n`);
    return next;
  }
  return { path, read, write };
}
