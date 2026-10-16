/*
  Warnings:

  - You are about to drop the column `implementation` on the `CaseStudy` table. All the data in the column will be lost.
  - The `challenge` column on the `CaseStudy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `solution` column on the `CaseStudy` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CaseStudy" DROP COLUMN "implementation",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cta" JSONB,
ADD COLUMN     "delivery" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "features" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "headline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lede" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "overview" TEXT[],
ADD COLUMN     "region" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "team" TEXT,
ADD COLUMN     "tech" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '',
DROP COLUMN "challenge",
ADD COLUMN     "challenge" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "solution",
ADD COLUMN     "solution" JSONB NOT NULL DEFAULT '[]';
