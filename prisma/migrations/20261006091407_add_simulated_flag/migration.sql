-- AlterTable
ALTER TABLE "GenerationEvent" ADD COLUMN     "simulated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "simulated" BOOLEAN NOT NULL DEFAULT false;
