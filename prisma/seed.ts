import "dotenv/config";
import { PrismaClient, PhonemeCategory, PhonemeSubgroup, ActivityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CONSONANT_GROUPS, VOWEL_GROUPS, PHONEME_LABELS, PHONEME_WORDS, type PhonemeWord } from "../src/lib/phonemes";
import { WORD_SEARCH_WORDS } from "../src/lib/wordSearch";
import { MAX_GUESSES } from "../src/lib/wordle";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Matches WordSearchHost.tsx's GRID_SIZE — kept here rather than imported
// since that constant isn't exported (it's a component-local render detail).
const GRID_SIZE = 10;

const CONSONANT_SUBGROUPS: Record<keyof typeof CONSONANT_GROUPS, PhonemeSubgroup> = {
  voicelessStops: PhonemeSubgroup.VOICELESS_STOPS,
  voicedStops: PhonemeSubgroup.VOICED_STOPS,
  nasals: PhonemeSubgroup.NASALS,
  voicelessFricatives: PhonemeSubgroup.VOICELESS_FRICATIVES,
  voicedFricatives: PhonemeSubgroup.VOICED_FRICATIVES,
  affricates: PhonemeSubgroup.AFFRICATES,
  approximants: PhonemeSubgroup.APPROXIMANTS,
};

const VOWEL_SUBGROUPS: Record<keyof typeof VOWEL_GROUPS, PhonemeSubgroup> = {
  monophthongs: PhonemeSubgroup.MONOPHTHONGS,
  diphthongs: PhonemeSubgroup.DIPHTHONGS,
  schwa: PhonemeSubgroup.SCHWA,
};

async function seedPhonemes() {
  let displayOrder = 0;

  for (const [key, symbols] of Object.entries(CONSONANT_GROUPS)) {
    const subgroup = CONSONANT_SUBGROUPS[key as keyof typeof CONSONANT_GROUPS];
    for (const symbol of symbols) {
      const label = PHONEME_LABELS[symbol];
      await db.phoneme.create({
        data: {
          symbol,
          letters: label.letters,
          example: label.example,
          category: PhonemeCategory.CONSONANT,
          subgroup,
          displayOrder: displayOrder++,
        },
      });
    }
  }

  for (const [key, symbols] of Object.entries(VOWEL_GROUPS)) {
    const subgroup = VOWEL_SUBGROUPS[key as keyof typeof VOWEL_GROUPS];
    for (const symbol of symbols) {
      const label = PHONEME_LABELS[symbol];
      await db.phoneme.create({
        data: {
          symbol,
          letters: label.letters,
          example: label.example,
          category: PhonemeCategory.VOWEL,
          subgroup,
          displayOrder: displayOrder++,
        },
      });
    }
  }
}

function seedWordList(name: string, words: PhonemeWord[]) {
  return db.wordList.create({
    data: {
      name,
      words: {
        create: words.map(({ word, phonemes }) => ({
          text: word,
          phonemes: {
            create: phonemes.map((symbol, position) => ({ phonemeSymbol: symbol, position })),
          },
        })),
      },
    },
  });
}

async function main() {
  // FK-safe delete order: Activity -(Restrict)-> WordList, WordPhoneme -(Restrict)-> Phoneme.
  await db.activity.deleteMany();
  await db.wordPhoneme.deleteMany();
  await db.word.deleteMany();
  await db.wordList.deleteMany();
  await db.phoneme.deleteMany();

  await seedPhonemes();

  const fullCorpus = await seedWordList("Full Phoneme Corpus", PHONEME_WORDS);
  const wordSearchList = await seedWordList("Word Search Demo List", WORD_SEARCH_WORDS);

  await db.activity.createMany({
    data: [
      {
        name: "Wordle – Easy (3 Phonemes)",
        type: ActivityType.WORDLE,
        wordListId: fullCorpus.id,
        difficulty: 3,
        maxGuesses: MAX_GUESSES,
      },
      {
        name: "Wordle – Hard (5 Phonemes)",
        type: ActivityType.WORDLE,
        wordListId: fullCorpus.id,
        difficulty: 5,
        maxGuesses: MAX_GUESSES,
      },
      {
        name: "Word Search – Classic",
        type: ActivityType.WORD_SEARCH,
        wordListId: wordSearchList.id,
        gridRows: GRID_SIZE,
        gridCols: GRID_SIZE,
      },
    ],
  });

  console.log("Seed complete:", {
    phoneme: await db.phoneme.count(),
    wordList: await db.wordList.count(),
    word: await db.word.count(),
    wordPhoneme: await db.wordPhoneme.count(),
    activity: await db.activity.count(),
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
