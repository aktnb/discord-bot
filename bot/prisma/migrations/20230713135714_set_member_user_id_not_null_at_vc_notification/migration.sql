/*
  Warnings:

  - Made the column `memberUserId` on table `vc_notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "vc_notification" ALTER COLUMN "memberUserId" SET NOT NULL;
