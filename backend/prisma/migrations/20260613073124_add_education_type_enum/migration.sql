/*
  Warnings:

  - The `educationType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EducationType" AS ENUM ('SCHOOL', 'COLLEGE', 'EMPLOYED', 'SELF_LEARNER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "educationType",
ADD COLUMN     "educationType" "EducationType";
