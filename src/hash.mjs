import { createHash, randomUUID } from "node:crypto";

export function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function stableId(prefix = "item") {
  return `${prefix}_${randomUUID()}`;
}
