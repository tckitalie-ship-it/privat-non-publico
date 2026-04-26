-- DropIndex
DROP INDEX "Association_slug_key";

-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT 'member';

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
