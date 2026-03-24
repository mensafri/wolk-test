-- CreateEnum
CREATE TYPE "HeroListType" AS ENUM ('BAN', 'PREFERRED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "DraftPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListHero" (
    "id" SERIAL NOT NULL,
    "draftPlanId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "type" "HeroListType" NOT NULL,
    "role" TEXT,
    "priority" "Priority",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnemyThreat" (
    "id" SERIAL NOT NULL,
    "draftPlanId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnemyThreat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTiming" (
    "id" SERIAL NOT NULL,
    "draftPlanId" INTEGER NOT NULL,
    "timing" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemTiming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroCache" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "localizedName" TEXT NOT NULL,
    "primaryAttr" TEXT NOT NULL,
    "attackType" TEXT NOT NULL,
    "roles" TEXT[],
    "legs" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroCache_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListHero" ADD CONSTRAINT "ListHero_draftPlanId_fkey" FOREIGN KEY ("draftPlanId") REFERENCES "DraftPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnemyThreat" ADD CONSTRAINT "EnemyThreat_draftPlanId_fkey" FOREIGN KEY ("draftPlanId") REFERENCES "DraftPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTiming" ADD CONSTRAINT "ItemTiming_draftPlanId_fkey" FOREIGN KEY ("draftPlanId") REFERENCES "DraftPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
