export interface DraftPlan {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftPlanListItem extends DraftPlan {
  banCount: number;
  pickCount: number;
  threatCount: number;
  timingCount: number;
}

export interface HeroCache {
  id: number;
  name: string;
  localizedName: string;
  primaryAttr: string;
  attackType: string;
  roles: string[];
  legs: number;
  imageUrl?: string;
}

export interface ListHero {
  id: number;
  draftPlanId: number;
  heroId: number;
  type: 'BAN' | 'PREFERRED';
  role?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  note?: string;
}

export interface EnemyThreat {
  id: number;
  draftPlanId: number;
  heroId: number;
  note?: string;
}

export interface ItemTiming {
  id: number;
  draftPlanId: number;
  timing: string;
  explanation: string;
}

export interface DraftPlanDetailData extends DraftPlan {
  heroes: ListHero[];
  enemyThreats: EnemyThreat[];
  itemTimings: ItemTiming[];
  synergyNote?: string;
}
