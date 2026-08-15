import { PHONEME_LABELS } from "@/lib/phonemes";
import { buildHtmlDocument } from "@/lib/htmlExport";
import { WORD_SEARCH_WORDS, type WordSearchPuzzle } from "@/lib/wordSearch";

const ENGINE_SRC = "/engines/word-search-engine.js";

export async function generateWordSearchHtml(puzzle: WordSearchPuzzle): Promise<string> {
  const engineSrc = await fetch(ENGINE_SRC).then((res) => res.text());

  const bodyHtml = `
<h1>Phoneme Word Games</h1>
<p class="subtitle">Drag across phonemes to find each word. Hover a cell to see its English letter equivalent.</p>
<div id="root"></div>
`;

  const mountCall = `
window.PhonemeWordSearchEngine.mount(document.getElementById("root"), {
  grid: ${JSON.stringify(puzzle.grid)},
  words: ${JSON.stringify(WORD_SEARCH_WORDS)},
  labels: ${JSON.stringify(PHONEME_LABELS)}
});
`;

  return buildHtmlDocument({
    title: "Word Search · Phoneme Word Games",
    bodyHtml,
    script: `${engineSrc}\n${mountCall}`,
  });
}
