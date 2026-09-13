-- CreateEnum
CREATE TYPE "PhonemeCategory" AS ENUM ('CONSONANT', 'VOWEL');

-- CreateEnum
CREATE TYPE "PhonemeSubgroup" AS ENUM ('VOICELESS_STOPS', 'VOICED_STOPS', 'NASALS', 'VOICELESS_FRICATIVES', 'VOICED_FRICATIVES', 'AFFRICATES', 'APPROXIMANTS', 'MONOPHTHONGS', 'DIPHTHONGS', 'SCHWA');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WORDLE', 'WORD_SEARCH');

-- CreateTable
CREATE TABLE "Phoneme" (
    "symbol" TEXT NOT NULL,
    "letters" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "category" "PhonemeCategory" NOT NULL,
    "subgroup" "PhonemeSubgroup" NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "Phoneme_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "WordList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "wordListId" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordPhoneme" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "phonemeSymbol" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "WordPhoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "wordListId" TEXT NOT NULL,
    "difficulty" INTEGER,
    "maxGuesses" INTEGER,
    "gridRows" INTEGER,
    "gridCols" INTEGER,
    "hintsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Phoneme_category_subgroup_displayOrder_idx" ON "Phoneme"("category", "subgroup", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WordList_name_key" ON "WordList"("name");

-- CreateIndex
CREATE INDEX "Word_wordListId_idx" ON "Word"("wordListId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_wordListId_text_key" ON "Word"("wordListId", "text");

-- CreateIndex
CREATE INDEX "WordPhoneme_wordId_idx" ON "WordPhoneme"("wordId");

-- CreateIndex
CREATE INDEX "WordPhoneme_phonemeSymbol_idx" ON "WordPhoneme"("phonemeSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "WordPhoneme_wordId_position_key" ON "WordPhoneme"("wordId", "position");

-- CreateIndex
CREATE INDEX "Activity_wordListId_idx" ON "Activity"("wordListId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_phonemeSymbol_fkey" FOREIGN KEY ("phonemeSymbol") REFERENCES "Phoneme"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
