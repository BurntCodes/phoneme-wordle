// Broad HCE (Harrington-Cox-Evans) Australian English phonemic transcription,
// sourced from the unit's phoneme corpus. The corpus mixes U+0067 "g" and the
// IPA-correct U+0261 "ɡ" for the same phoneme; every symbol below is normalized
// to U+0261.
//
// This is now only prisma/seed.ts's source of truth, not the live app's —
// the frontend reads phoneme/word data from the database via /api/* once
// seeded. Interfaces (PhonemeLabel, PhonemeWord) are still imported for
// their types elsewhere.

export interface PhonemeLabel {
  letters: string
  example: string
}

export interface PhonemeWord {
  word: string
  phonemes: string[]
}

export const CONSONANT_GROUPS = {
  voicelessStops: ['p', 't', 'k'],
  voicedStops: ['b', 'd', 'ɡ'],
  nasals: ['m', 'n', 'ŋ'],
  voicelessFricatives: ['f', 's', 'θ', 'ʃ', 'h'],
  voicedFricatives: ['v', 'z', 'ð', 'ʒ'],
  affricates: ['tʃ', 'dʒ'],
  approximants: ['l', 'ɹ', 'w', 'j'],
} as const

export const VOWEL_GROUPS = {
  monophthongs: ['iː', 'ɪ', 'e', 'eː', 'æ', 'ɐ', 'ɐː', 'ɜː', 'ʉː', 'ɔ', 'oː', 'ʊ'],
  diphthongs: ['æɪ', 'ɑe', 'oɪ', 'əʉ', 'æɔ', 'ɪə'],
  schwa: ['ə'],
} as const

export const ALL_PHONEMES: string[] = [
  ...Object.values(CONSONANT_GROUPS).flat(),
  ...Object.values(VOWEL_GROUPS).flat(),
]

export const PHONEME_LABELS: Record<string, PhonemeLabel> = {
  p: { letters: 'P', example: 'pea' },
  t: { letters: 'T', example: 'tea' },
  k: { letters: 'K', example: 'key' },
  b: { letters: 'B', example: 'bee' },
  d: { letters: 'D', example: 'day' },
  ɡ: { letters: 'G', example: 'go' },
  m: { letters: 'M', example: 'me' },
  n: { letters: 'N', example: 'no' },
  ŋ: { letters: 'NG', example: 'sing' },
  f: { letters: 'F', example: 'fan' },
  s: { letters: 'S', example: 'sun' },
  θ: { letters: 'TH', example: 'thin' },
  ʃ: { letters: 'SH', example: 'ship' },
  h: { letters: 'H', example: 'hat' },
  v: { letters: 'V', example: 'van' },
  z: { letters: 'Z', example: 'zip' },
  ð: { letters: 'TH', example: 'then' },
  ʒ: { letters: 'ZH', example: 'treasure' },
  tʃ: { letters: 'CH', example: 'chin' },
  dʒ: { letters: 'J', example: 'jam' },
  l: { letters: 'L', example: 'log' },
  ɹ: { letters: 'R', example: 'ring' },
  w: { letters: 'W', example: 'win' },
  j: { letters: 'Y', example: 'yes' },
  iː: { letters: 'EE', example: 'scream' },
  ɪ: { letters: 'I', example: 'bid' },
  e: { letters: 'E', example: 'bed' },
  eː: { letters: 'AIR', example: 'hair' },
  æ: { letters: 'A', example: 'bad' },
  ɐ: { letters: 'U', example: 'bud' },
  ɐː: { letters: 'AR', example: 'bark' },
  ɜː: { letters: 'ER', example: 'bird' },
  ʉː: { letters: 'OO', example: 'boot' },
  ɔ: { letters: 'O', example: 'log' },
  oː: { letters: 'OR', example: 'fork' },
  ʊ: { letters: 'OO', example: 'book' },
  æɪ: { letters: 'AI', example: 'bait' },
  ɑe: { letters: 'EYE', example: 'bike' },
  oɪ: { letters: 'OY', example: 'boil' },
  əʉ: { letters: 'OH', example: 'boat' },
  æɔ: { letters: 'OW', example: 'cloud' },
  ɪə: { letters: 'EAR', example: 'beard' },
  ə: { letters: 'UH', example: 'about' },
}

export const PHONEME_WORDS: PhonemeWord[] = [
  // 3 phonemes
  { word: 'bed', phonemes: ['b', 'e', 'd'] },
  { word: 'bid', phonemes: ['b', 'ɪ', 'd'] },
  { word: 'bad', phonemes: ['b', 'æ', 'd'] },
  { word: 'bud', phonemes: ['b', 'ɐ', 'd'] },
  { word: 'bird', phonemes: ['b', 'ɜː', 'd'] },
  { word: 'bark', phonemes: ['b', 'ɐː', 'k'] },
  { word: 'book', phonemes: ['b', 'ʊ', 'k'] },
  { word: 'boot', phonemes: ['b', 'ʉː', 't'] },
  { word: 'boat', phonemes: ['b', 'əʉ', 't'] },
  { word: 'bike', phonemes: ['b', 'ɑe', 'k'] },
  { word: 'bait', phonemes: ['b', 'æɪ', 't'] },
  { word: 'boil', phonemes: ['b', 'oɪ', 'l'] },
  { word: 'beard', phonemes: ['b', 'ɪə', 'd'] },
  { word: 'choice', phonemes: ['tʃ', 'oɪ', 's'] },
  { word: 'thin', phonemes: ['θ', 'ɪ', 'n'] },
  { word: 'then', phonemes: ['ð', 'e', 'n'] },
  { word: 'ship', phonemes: ['ʃ', 'ɪ', 'p'] },
  { word: 'chin', phonemes: ['tʃ', 'ɪ', 'n'] },
  { word: 'jam', phonemes: ['dʒ', 'æ', 'm'] },
  { word: 'yes', phonemes: ['j', 'e', 's'] },
  { word: 'win', phonemes: ['w', 'ɪ', 'n'] },
  { word: 'ring', phonemes: ['ɹ', 'ɪ', 'ŋ'] },
  { word: 'log', phonemes: ['l', 'ɔ', 'ɡ'] },
  { word: 'fan', phonemes: ['f', 'æ', 'n'] },
  { word: 'van', phonemes: ['v', 'æ', 'n'] },
  { word: 'sun', phonemes: ['s', 'ɐ', 'n'] },
  { word: 'zip', phonemes: ['z', 'ɪ', 'p'] },
  { word: 'gum', phonemes: ['ɡ', 'ɐ', 'm'] },
  { word: 'hat', phonemes: ['h', 'æ', 't'] },
  { word: 'fork', phonemes: ['f', 'oː', 'k'] },

  // 4 phonemes
  { word: 'stop', phonemes: ['s', 't', 'ɔ', 'p'] },
  { word: 'frog', phonemes: ['f', 'ɹ', 'ɔ', 'ɡ'] },
  { word: 'clap', phonemes: ['k', 'l', 'æ', 'p'] },
  { word: 'slip', phonemes: ['s', 'l', 'ɪ', 'p'] },
  { word: 'drum', phonemes: ['d', 'ɹ', 'ɐ', 'm'] },
  { word: 'grin', phonemes: ['ɡ', 'ɹ', 'ɪ', 'n'] },
  { word: 'train', phonemes: ['t', 'ɹ', 'æɪ', 'n'] },
  { word: 'cloud', phonemes: ['k', 'l', 'æɔ', 'd'] },
  { word: 'snake', phonemes: ['s', 'n', 'æɪ', 'k'] },
  { word: 'smile', phonemes: ['s', 'm', 'ɑe', 'l'] },
  { word: 'milk', phonemes: ['m', 'ɪ', 'l', 'k'] },
  { word: 'hand', phonemes: ['h', 'æ', 'n', 'd'] },
  { word: 'tent', phonemes: ['t', 'e', 'n', 't'] },
  { word: 'jump', phonemes: ['dʒ', 'ɐ', 'm', 'p'] },
  { word: 'lamp', phonemes: ['l', 'æ', 'm', 'p'] },
  { word: 'bank', phonemes: ['b', 'æ', 'ŋ', 'k'] },
  { word: 'frame', phonemes: ['f', 'ɹ', 'æɪ', 'm'] },
  { word: 'cold', phonemes: ['k', 'əʉ', 'l', 'd'] },
  { word: 'wind', phonemes: ['w', 'ɪ', 'n', 'd'] },
  { word: 'soft', phonemes: ['s', 'ɔ', 'f', 't'] },
  { word: 'gift', phonemes: ['ɡ', 'ɪ', 'f', 't'] },
  { word: 'desk', phonemes: ['d', 'e', 's', 'k'] },
  { word: 'left', phonemes: ['l', 'e', 'f', 't'] },
  { word: 'pond', phonemes: ['p', 'ɔ', 'n', 'd'] },
  { word: 'golf', phonemes: ['ɡ', 'ɔ', 'l', 'f'] },
  { word: 'silk', phonemes: ['s', 'ɪ', 'l', 'k'] },
  { word: 'great', phonemes: ['ɡ', 'ɹ', 'æɪ', 't'] },
  { word: 'crab', phonemes: ['k', 'ɹ', 'æ', 'b'] },
  { word: 'plug', phonemes: ['p', 'l', 'ɐ', 'ɡ'] },
  { word: 'quiz', phonemes: ['k', 'w', 'ɪ', 'z'] },

  // 5 phonemes
  { word: 'stamp', phonemes: ['s', 't', 'æ', 'm', 'p'] },
  { word: 'plant', phonemes: ['p', 'l', 'æ', 'n', 't'] },
  { word: 'blank', phonemes: ['b', 'l', 'æ', 'ŋ', 'k'] },
  { word: 'grand', phonemes: ['ɡ', 'ɹ', 'æ', 'n', 'd'] },
  { word: 'clamp', phonemes: ['k', 'l', 'æ', 'm', 'p'] },
  { word: 'twist', phonemes: ['t', 'w', 'ɪ', 's', 't'] },
  { word: 'trust', phonemes: ['t', 'ɹ', 'ɐ', 's', 't'] },
  { word: 'drink', phonemes: ['d', 'ɹ', 'ɪ', 'ŋ', 'k'] },
  { word: 'brisk', phonemes: ['b', 'ɹ', 'ɪ', 's', 'k'] },
  { word: 'shrimp', phonemes: ['ʃ', 'ɹ', 'ɪ', 'm', 'p'] },
  { word: 'scrap', phonemes: ['s', 'k', 'ɹ', 'æ', 'p'] },
  { word: 'scribe', phonemes: ['s', 'k', 'ɹ', 'ɑe', 'b'] },
  { word: 'scream', phonemes: ['s', 'k', 'ɹ', 'iː', 'm'] },
  { word: 'splash', phonemes: ['s', 'p', 'l', 'æ', 'ʃ'] },
  { word: 'spring', phonemes: ['s', 'p', 'ɹ', 'ɪ', 'ŋ'] },
  { word: 'strap', phonemes: ['s', 't', 'ɹ', 'æ', 'p'] },
  { word: 'street', phonemes: ['s', 't', 'ɹ', 'iː', 't'] },
  { word: 'scrub', phonemes: ['s', 'k', 'ɹ', 'ɐ', 'b'] },
  { word: 'flask', phonemes: ['f', 'l', 'ɐː', 's', 'k'] },
  { word: 'clasp', phonemes: ['k', 'l', 'ɐː', 's', 'p'] },
  { word: 'cleft', phonemes: ['k', 'l', 'e', 'f', 't'] },
  { word: 'glint', phonemes: ['ɡ', 'l', 'ɪ', 'n', 't'] },
  { word: 'blend', phonemes: ['b', 'l', 'e', 'n', 'd'] },
  { word: 'strain', phonemes: ['s', 't', 'ɹ', 'æɪ', 'n'] },
  { word: 'thrust', phonemes: ['θ', 'ɹ', 'ɐ', 's', 't'] },
  { word: 'sprawl', phonemes: ['s', 'p', 'ɹ', 'oː', 'l'] },
  { word: 'scrawl', phonemes: ['s', 'k', 'ɹ', 'oː', 'l'] },
  { word: 'sprig', phonemes: ['s', 'p', 'ɹ', 'ɪ', 'ɡ'] },
  { word: 'sprout', phonemes: ['s', 'p', 'ɹ', 'æɔ', 't'] },
  { word: 'smoked', phonemes: ['s', 'm', 'əʉ', 'k', 't'] },
]
