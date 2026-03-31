import { Response } from 'express';
import { prisma } from '../lib/prisma';

export type OwnershipResult = 'OK' | 'NOT_FOUND' | 'FORBIDDEN';

export async function userOwnsDraftPlan(draftPlanId: number, userId: number): Promise<OwnershipResult> {
  const plan = await prisma.draftPlan.findUnique({
    where: { id: draftPlanId },
    select: { userId: true }
  });

  if (!plan) {
    return 'NOT_FOUND';
  }

  if (plan.userId !== userId) {
    return 'FORBIDDEN';
  }

  return 'OK';
}

export async function userOwnsListHero(listHeroId: number, userId: number): Promise<OwnershipResult> {
  const listHero = await prisma.listHero.findUnique({
    where: { id: listHeroId },
    select: {
      draftPlan: {
        select: { userId: true }
      }
    }
  });

  if (!listHero) {
    return 'NOT_FOUND';
  }

  if (listHero.draftPlan.userId !== userId) {
    return 'FORBIDDEN';
  }

  return 'OK';
}

export async function userOwnsThreat(threatId: number, userId: number): Promise<OwnershipResult> {
  const threat = await prisma.enemyThreat.findUnique({
    where: { id: threatId },
    select: {
      draftPlan: {
        select: { userId: true }
      }
    }
  });

  if (!threat) {
    return 'NOT_FOUND';
  }

  if (threat.draftPlan.userId !== userId) {
    return 'FORBIDDEN';
  }

  return 'OK';
}

export async function userOwnsTiming(timingId: number, userId: number): Promise<OwnershipResult> {
  const timing = await prisma.itemTiming.findUnique({
    where: { id: timingId },
    select: {
      draftPlan: {
        select: { userId: true }
      }
    }
  });

  if (!timing) {
    return 'NOT_FOUND';
  }

  if (timing.draftPlan.userId !== userId) {
    return 'FORBIDDEN';
  }

  return 'OK';
}

export function handleOwnershipResult(res: Response, result: OwnershipResult) {
  if (result === 'NOT_FOUND') {
    res.status(404).json({ error: 'Not found' });
    return false;
  }

  if (result === 'FORBIDDEN') {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }

  return true;
}
