/*
  Warnings:

  - Added the required column `userId` to the `DraftPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DraftPlan" ADD COLUMN     "synergyNote" TEXT,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobQueue" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "DraftPlan" ADD CONSTRAINT "DraftPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
