export function normalizeSourceText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

export function cleanNarrationText(value) {
  return normalizeSourceText(value)
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitText(text, maxChars = 800) {
  const source = cleanNarrationText(text);
  const chunks = [];
  let cursor = 0;
  while (cursor < source.length) {
    const hardEnd = Math.min(cursor + maxChars, source.length);
    let end = hardEnd;
    if (hardEnd < source.length) {
      const slice = source.slice(cursor, hardEnd);
      const boundary = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("\n\n"), slice.lastIndexOf(" "));
      if (boundary > maxChars * 0.5) end = cursor + boundary + 1;
    }
    const value = source.slice(cursor, end).trim();
    if (value) chunks.push({ index: chunks.length + 1, text: value, sourceCharStart: cursor, sourceCharEnd: end });
    cursor = Math.max(end, cursor + 1);
    while (/\s/.test(source[cursor] ?? "")) cursor += 1;
  }
  return chunks;
}
