-- AlterTable
ALTER TABLE "participants" ADD COLUMN "checkedIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "participants" ADD COLUMN "checkedInAt" TIMESTAMP(3);
