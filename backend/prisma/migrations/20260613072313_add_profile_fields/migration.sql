/*
  Warnings:

  - You are about to drop the column `year` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "year",
ADD COLUMN     "academicYear" INTEGER,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "educationType" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "schoolName" TEXT,
ADD COLUMN     "standard" INTEGER;
