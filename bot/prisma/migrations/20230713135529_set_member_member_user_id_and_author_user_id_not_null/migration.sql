/*
  Warnings:

  - Made the column `guildId` on table `response` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorUserId` on table `response` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "response" ALTER COLUMN "guildId" SET NOT NULL,
ALTER COLUMN "authorUserId" SET NOT NULL;
