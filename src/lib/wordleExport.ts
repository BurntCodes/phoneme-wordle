import { CONSONANT_GROUPS, VOWEL_GROUPS, PHONEME_LABELS, type PhonemeWord } from "@/lib/phonemes";
import { buildHtmlDocument } from "@/lib/htmlExport";
import { MAX_GUESSES } from "@/lib/wordle";

const ENGINE_SRC = "/engines/wordle-engine.js";

export async function generateWordleHtml(target: PhonemeWord): Promise<string> {
  const engineSrc = await fetch(ENGINE_SRC).then((res) => res.text());

  const bodyHtml = `
<h1>Phoneme Wordle</h1>
<p class="subtitle">Guess the phoneme word. Hover a key to see its English letter equivalent.</p>
<div id="root"></div>
`;

  const mountCall = `
window.PhonemeWordleEngine.mount(document.getElementById("root"), {
  target: ${JSON.stringify(target)},
  labels: ${JSON.stringify(PHONEME_LABELS)},
  consonantRows: ${JSON.stringify(Object.values(CONSONANT_GROUPS))},
  vowelRows: ${JSON.stringify(Object.values(VOWEL_GROUPS))},
  maxGuesses: ${MAX_GUESSES}
});
`;

  return buildHtmlDocument({
    title: `Phoneme Wordle — ${target.word}`,
    bodyHtml,
    script: `${engineSrc}\n${mountCall}`,
  });
}
