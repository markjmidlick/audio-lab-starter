import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function wavHeader({ dataBytes, sampleRate = 16000 }) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + dataBytes, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(dataBytes, 40);
  return header;
}

export async function generateFixtureAudio({ outputPath, chunks }) {
  const sampleRate = 16000;
  const durationSeconds = Math.max(1, Math.min(8, chunks.length * 1.25));
  const samples = Math.floor(sampleRate * durationSeconds);
  const pcm = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i += 1) {
    const envelope = Math.min(1, i / 800, (samples - i) / 800);
    pcm.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 220 * i) / sampleRate) * 1800 * envelope), i * 2);
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.concat([wavHeader({ dataBytes: pcm.length, sampleRate }), pcm]));
  return {
    provider: "synthetic-fixture",
    voice: "tone",
    durationSeconds,
    sections: chunks.map((chunk, index) => ({ ...chunk, audioStartSeconds: index * durationSeconds / chunks.length, audioEndSeconds: (index + 1) * durationSeconds / chunks.length }))
  };
}
