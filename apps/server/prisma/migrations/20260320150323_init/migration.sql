-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isTimingTask" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timingTaskTime" TEXT DEFAULT '00:00:00';
