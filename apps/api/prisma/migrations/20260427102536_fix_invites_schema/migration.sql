/*
  Warnings:

  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email,associationId]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_associationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_invitedByUserId_fkey";

-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "role" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."Invitation";

-- DropEnum
DROP TYPE "public"."InvitationStatus";

-- CreateIndex
CREATE INDEX "Invite_associationId_idx" ON "Invite"("associationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_email_associationId_key" ON "Invite"("email", "associationId");
