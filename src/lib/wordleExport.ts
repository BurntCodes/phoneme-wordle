import { buildHtmlDocument } from "@/lib/htmlExport";

const ENGINE_SRC = "/engines/wordle-engine.js";

export interface WordleMountOptions {
  target: { word: string; phonemes: string[] };
  labels: Record<string, { letters: string; example: string }>;
  consonantRows: string[][];
  vowelRows: string[][];
  maxGuesses: number;
}

// Takes the exact object passed to window.PhonemeWordleEngine.mount() in the
// live preview and serializes it verbatim — the generated file's data is
// guaranteed to match what was on screen, not just the engine code.
// `isDark` matches it up visually too: the engine's own CSS already has a
// dormant `.dark { --pwe-*: ... }` block, so it just needs that class on an
// ancestor to activate.
export async function generateWordleHtml(options: WordleMountOptions, isDark: boolean): Promise<string> {
  const engineSrc = await fetch(ENGINE_SRC).then((res) => res.text());

  const bodyHtml = `
<h1>Phoneme Word Games</h1>
<p class="subtitle">Guess the phoneme word. Hover a key to see its English letter equivalent.</p>
<div id="root"></div>
`;

  const mountCall = `
window.PhonemeWordleEngine.mount(document.getElementById("root"), ${JSON.stringify(options)});
`;

  return buildHtmlDocument({
    title: "Wordle · Phoneme Word Games",
    bodyHtml,
    script: `${engineSrc}\n${mountCall}`,
    isDark,
  });
}
