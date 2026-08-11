/*
  Warnings:

  - A unique constraint covering the columns `[associationId,memberNumber]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - Made the column `status` on table `Invitation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_associationId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'REGISTERED';

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "filename" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "memberNumber" INTEGER;

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Event_associationId_idx" ON "Event"("associationId");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "File_associationId_idx" ON "File"("associationId");

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- CreateIndex
CREATE INDEX "File_uploadedById_idx" ON "File"("uploadedById");

-- CreateIndex
CREATE INDEX "Invitation_associationId_idx" ON "Invitation"("associationId");

-- CreateIndex
CREATE INDEX "Invitation_invitedById_idx" ON "Invitation"("invitedById");

-- CreateIndex
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_associationId_idx" ON "Membership"("associationId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_associationId_memberNumber_key" ON "Membership"("associationId", "memberNumber");

-- CreateIndex
CREATE INDEX "Notification_associationId_idx" ON "Notification"("associationId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Transaction_associationId_idx" ON "Transaction"("associationId");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
