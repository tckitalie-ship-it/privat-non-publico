-- DropIndex
DROP INDEX "public"."EventRegistration_eventId_idx";

-- DropIndex
DROP INDEX "public"."EventRegistration_userId_idx";

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'REGISTERED';
