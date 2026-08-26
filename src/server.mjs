import { resolve } from "node:path";
import { createAudioLab } from "./app.mjs";

const host = process.env.AUDIO_LAB_HOST || "127.0.0.1";
const port = Number(process.env.AUDIO_LAB_PORT || 4188);
const dataDir = resolve(process.env.AUDIO_LAB_DATA_DIR || ".data");
const publicDir = resolve("public");
const app = createAudioLab({ dataDir, publicDir, maxTextChars: Number(process.env.AUDIO_LAB_MAX_TEXT_CHARS || 40000) });
app.server.listen(port, host, () => console.log(`Audio Lab starter: http://${host}:${port}`));
