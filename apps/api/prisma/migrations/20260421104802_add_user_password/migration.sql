/*
  Warnings:

  - You are about to drop the column `isActive` on the `Association` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Association` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Association" DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";
