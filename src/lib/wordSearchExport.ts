import { buildHtmlDocument } from "@/lib/htmlExport";

const ENGINE_SRC = "/engines/word-search-engine.js";

export interface WordSearchMountOptions {
  grid: string[][];
  words: { word: string; phonemes: string[] }[];
  labels: Record<string, { letters: string; example: string }>;
}

// Same rationale as wordleExport.ts: serialize the exact object the live
// preview mounted, so the export can never drift from what was on screen.
export async function generateWordSearchHtml(options: WordSearchMountOptions): Promise<string> {
  const engineSrc = await fetch(ENGINE_SRC).then((res) => res.text());

  const bodyHtml = `
<h1>Phoneme Word Games</h1>
<p class="subtitle">Drag across phonemes to find each word. Hover a cell to see its English letter equivalent.</p>
<div id="root"></div>
`;

  const mountCall = `
window.PhonemeWordSearchEngine.mount(document.getElementById("root"), ${JSON.stringify(options)});
`;

  return buildHtmlDocument({
    title: "Word Search · Phoneme Word Games",
    bodyHtml,
    script: `${engineSrc}\n${mountCall}`,
  });
}
