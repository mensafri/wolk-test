import { HeroCache } from '@prisma/client';
import axios from 'axios';
import { HERO_CACHE_MAX_AGE_MS } from '../config';
import { prisma } from '../lib/prisma';

type OpenDotaHeroStats = {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles?: string[];
  legs: number;
  img?: string | null;
};

function resolveHeroImageUrl(imgPath?: string | null) {
  if (!imgPath) {
    return undefined;
  }

  const normalizedPath = imgPath.replace(/\?$/, '');
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    return normalizedPath;
  }

  return `https://cdn.cloudflare.steamstatic.com${normalizedPath}`;
}

function isUsableHeroCache(cachedHeroes: HeroCache[]) {
  if (cachedHeroes.length === 0) {
    return false;
  }

  const firstHero = cachedHeroes[0];
  const cacheAgeMs = Date.now() - new Date(firstHero.updatedAt).getTime();
  const cacheHasImages = cachedHeroes.every((hero) => Boolean(hero.imageUrl));
  const cacheUsesReachableImageHost = cachedHeroes.every(
    (hero) =>
      !hero.imageUrl || hero.imageUrl.startsWith('https://cdn.cloudflare.steamstatic.com/')
  );

  return cacheAgeMs < HERO_CACHE_MAX_AGE_MS && cacheHasImages && cacheUsesReachableImageHost;
}

export async function getHeroes() {
  const cachedHeroes = await prisma.heroCache.findMany({
    orderBy: { localizedName: 'asc' }
  });

  if (isUsableHeroCache(cachedHeroes)) {
    return cachedHeroes;
  }

  try {
    const response = await axios.get<OpenDotaHeroStats[]>('https://api.opendota.com/api/heroStats');
    const heroesData = response.data;

    await Promise.all(
      heroesData.map((hero) =>
        prisma.heroCache.upsert({
          where: { id: hero.id },
          update: {
            name: hero.name,
            localizedName: hero.localized_name,
            primaryAttr: hero.primary_attr,
            attackType: hero.attack_type,
            roles: hero.roles ?? [],
            legs: hero.legs,
            imageUrl: resolveHeroImageUrl(hero.img)
          },
          create: {
            id: hero.id,
            name: hero.name,
            localizedName: hero.localized_name,
            primaryAttr: hero.primary_attr,
            attackType: hero.attack_type,
            roles: hero.roles ?? [],
            legs: hero.legs,
            imageUrl: resolveHeroImageUrl(hero.img)
          }
        })
      )
    );

    return prisma.heroCache.findMany({
      orderBy: { localizedName: 'asc' }
    });
  } catch (error) {
    console.error('Failed to fetch heroes', error);

    if (cachedHeroes.length > 0) {
      return cachedHeroes;
    }

    throw error;
  }
}
