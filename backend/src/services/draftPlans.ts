import { HeroListType, Priority } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  OwnershipResult,
  userOwnsDraftPlan,
  userOwnsListHero,
  userOwnsThreat,
  userOwnsTiming
} from './ownership';

type ServiceResult<T> = { status: 'OK'; data: T } | { status: Exclude<OwnershipResult, 'OK'> };

function asServiceResult<T>(status: OwnershipResult, data: T): ServiceResult<T> {
  if (status !== 'OK') {
    return { status };
  }

  return { status: 'OK', data };
}

export async function listDraftPlansForUser(userId: number) {
  const plans = await prisma.draftPlan.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      heroes: {
        select: { type: true }
      },
      _count: {
        select: {
          enemyThreats: true,
          itemTimings: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    banCount: plan.heroes.filter((hero) => hero.type === 'BAN').length,
    pickCount: plan.heroes.filter((hero) => hero.type === 'PREFERRED').length,
    threatCount: plan._count.enemyThreats,
    timingCount: plan._count.itemTimings
  }));
}

export async function createDraftPlanForUser(
  userId: number,
  input: { name: string; description?: string }
) {
  const plan = await prisma.draftPlan.create({
    data: {
      name: input.name,
      description: input.description,
      userId
    }
  });

  await prisma.jobQueue.create({
    data: {
      type: 'ANALYZE_SYNERGY',
      payload: JSON.stringify({ draftPlanId: plan.id })
    }
  });

  return plan;
}

export async function getDraftPlanDetailForUser(planId: number, userId: number) {
  const plan = await prisma.draftPlan.findUnique({
    where: { id: planId },
    include: {
      heroes: true,
      enemyThreats: true,
      itemTimings: true
    }
  });

  if (!plan) {
    return { status: 'NOT_FOUND' as const };
  }

  if (plan.userId !== userId) {
    return { status: 'FORBIDDEN' as const };
  }

  return {
    status: 'OK' as const,
    data: plan
  };
}

export async function addHeroToDraftPlan(
  draftPlanId: number,
  userId: number,
  input: {
    heroId: number;
    type: HeroListType;
    role?: string;
    priority?: Priority | null;
    note?: string;
  }
) {
  const status = await userOwnsDraftPlan(draftPlanId, userId);
  if (status !== 'OK') {
    return { status };
  }

  const listHero = await prisma.listHero.create({
    data: {
      draftPlanId,
      heroId: input.heroId,
      type: input.type,
      role: input.role,
      priority: input.priority,
      note: input.note
    }
  });

  return { status: 'OK' as const, data: listHero };
}

export async function updateListHeroForUser(
  listHeroId: number,
  userId: number,
  input: { role?: string; priority?: Priority | null; note?: string }
) {
  const status = await userOwnsListHero(listHeroId, userId);
  if (status !== 'OK') {
    return { status };
  }

  const listHero = await prisma.listHero.update({
    where: { id: listHeroId },
    data: {
      role: input.role,
      priority: input.priority,
      note: input.note
    }
  });

  return { status: 'OK' as const, data: listHero };
}

export async function deleteListHeroForUser(
  listHeroId: number,
  userId: number
): Promise<ServiceResult<{ success: true }>> {
  const status = await userOwnsListHero(listHeroId, userId);
  if (status !== 'OK') {
    return { status };
  }

  await prisma.listHero.delete({ where: { id: listHeroId } });
  return asServiceResult(status, { success: true });
}

export async function addThreatToDraftPlan(
  draftPlanId: number,
  userId: number,
  input: { heroId: number; note?: string }
) {
  const status = await userOwnsDraftPlan(draftPlanId, userId);
  if (status !== 'OK') {
    return { status };
  }

  const threat = await prisma.enemyThreat.create({
    data: {
      draftPlanId,
      heroId: input.heroId,
      note: input.note
    }
  });

  return { status: 'OK' as const, data: threat };
}

export async function updateThreatForUser(threatId: number, userId: number, note?: string) {
  const status = await userOwnsThreat(threatId, userId);
  if (status !== 'OK') {
    return { status };
  }

  const threat = await prisma.enemyThreat.update({
    where: { id: threatId },
    data: { note }
  });

  return { status: 'OK' as const, data: threat };
}

export async function deleteThreatForUser(
  threatId: number,
  userId: number
): Promise<ServiceResult<{ success: true }>> {
  const status = await userOwnsThreat(threatId, userId);
  if (status !== 'OK') {
    return { status };
  }

  await prisma.enemyThreat.delete({ where: { id: threatId } });
  return asServiceResult(status, { success: true });
}

export async function addItemTimingToDraftPlan(
  draftPlanId: number,
  userId: number,
  input: { timing: string; explanation: string }
) {
  const status = await userOwnsDraftPlan(draftPlanId, userId);
  if (status !== 'OK') {
    return { status };
  }

  const itemTiming = await prisma.itemTiming.create({
    data: {
      draftPlanId,
      timing: input.timing,
      explanation: input.explanation
    }
  });

  return { status: 'OK' as const, data: itemTiming };
}

export async function updateItemTimingForUser(
  timingId: number,
  userId: number,
  input: { timing?: string; explanation?: string }
) {
  const status = await userOwnsTiming(timingId, userId);
  if (status !== 'OK') {
    return { status };
  }

  const itemTiming = await prisma.itemTiming.update({
    where: { id: timingId },
    data: {
      timing: input.timing,
      explanation: input.explanation
    }
  });

  return { status: 'OK' as const, data: itemTiming };
}

export async function deleteItemTimingForUser(
  timingId: number,
  userId: number
): Promise<ServiceResult<{ success: true }>> {
  const status = await userOwnsTiming(timingId, userId);
  if (status !== 'OK') {
    return { status };
  }

  await prisma.itemTiming.delete({ where: { id: timingId } });
  return asServiceResult(status, { success: true });
}
