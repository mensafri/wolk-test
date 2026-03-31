import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';
const HERO_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function resolveHeroImageUrl(imgPath?: string | null) {
  if (!imgPath) return undefined;
  const normalizedPath = imgPath.replace(/\?$/, '');
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
  return `https://cdn.cloudflare.steamstatic.com${normalizedPath}`;
}

async function userOwnsDraftPlan(draftPlanId: number, userId: number) {
  const plan = await prisma.draftPlan.findUnique({
    where: { id: draftPlanId },
    select: { userId: true }
  });

  if (!plan) return 'NOT_FOUND' as const;
  if (plan.userId !== userId) return 'FORBIDDEN' as const;
  return 'OK' as const;
}

async function userOwnsListHero(listHeroId: number, userId: number) {
  const listHero = await prisma.listHero.findUnique({
    where: { id: listHeroId },
    select: {
      draftPlan: {
        select: { userId: true }
      }
    }
  });

  if (!listHero) return 'NOT_FOUND' as const;
  if (listHero.draftPlan.userId !== userId) return 'FORBIDDEN' as const;
  return 'OK' as const;
}

async function userOwnsThreat(threatId: number, userId: number) {
  const threat = await prisma.enemyThreat.findUnique({
    where: { id: threatId },
    select: {
      draftPlan: {
        select: { userId: true }
      }
    }
  });

  if (!threat) return 'NOT_FOUND' as const;
  if (threat.draftPlan.userId !== userId) return 'FORBIDDEN' as const;
  return 'OK' as const;
}

async function userOwnsTiming(timingId: number, userId: number) {
  const timing = await prisma.itemTiming.findUnique({
    where: { id: timingId },
    select: {
      draftPlan: {
        select: { userId: true }
      }
    }
  });

  if (!timing) return 'NOT_FOUND' as const;
  if (timing.draftPlan.userId !== userId) return 'FORBIDDEN' as const;
  return 'OK' as const;
}

function handleOwnershipResult(res: Response, result: 'OK' | 'NOT_FOUND' | 'FORBIDDEN') {
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

// Extend Express Request
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; username: string };
  }
}

// Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user as any;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword }
    });
    
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: 'Username may already exist' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username } });
});

// --- Draft Plans ---

app.get('/api/draft-plans', authenticateToken, async (req, res) => {
  const plans = await prisma.draftPlan.findMany({
    where: { userId: req.user!.id },
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

  res.json(
    plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      banCount: plan.heroes.filter((hero) => hero.type === 'BAN').length,
      pickCount: plan.heroes.filter((hero) => hero.type === 'PREFERRED').length,
      threatCount: plan._count.enemyThreats,
      timingCount: plan._count.itemTimings
    }))
  );
});

app.post('/api/draft-plans', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const plan = await prisma.draftPlan.create({
    data: { name, description, userId: req.user!.id }
  });

  // BONUS: Create a background job for this new draft plan
  await prisma.jobQueue.create({
    data: {
      type: 'ANALYZE_SYNERGY',
      payload: JSON.stringify({ draftPlanId: plan.id })
    }
  });

  res.json(plan);
});

app.get('/api/draft-plans/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const plan = await prisma.draftPlan.findUnique({
    where: { id },
    include: {
      heroes: true,
      enemyThreats: true,
      itemTimings: true
    }
  });
  if (!plan) return res.status(404).json({ error: 'Not found' });
  if (plan.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  
  res.json(plan);
});

// --- List Heroes & Threats Operations ---

app.post('/api/draft-plans/:id/heroes', authenticateToken, async (req, res) => {
  const draftPlanId = parseInt(req.params.id as string);
  const { heroId, type, role, priority, note } = req.body;
  const ownership = await userOwnsDraftPlan(draftPlanId, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  const listHero = await prisma.listHero.create({
    data: { draftPlanId, heroId: parseInt(heroId), type, role, priority, note }
  });
  res.json(listHero);
});

app.put('/api/draft-plans/heroes/:heroId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.heroId as string);
  const { role, priority, note } = req.body;
  const ownership = await userOwnsListHero(id, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  const listHero = await prisma.listHero.update({
    where: { id },
    data: { role, priority, note }
  });
  res.json(listHero);
});

app.delete('/api/draft-plans/heroes/:heroId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.heroId as string);
  const ownership = await userOwnsListHero(id, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  await prisma.listHero.delete({ where: { id } });
  res.json({ success: true });
});

app.post('/api/draft-plans/:id/threats', authenticateToken, async (req, res) => {
  const draftPlanId = parseInt(req.params.id as string);
  const { heroId, note } = req.body;
  const ownership = await userOwnsDraftPlan(draftPlanId, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  const threat = await prisma.enemyThreat.create({
    data: { draftPlanId, heroId: parseInt(heroId), note }
  });
  res.json(threat);
});

app.put('/api/draft-plans/threats/:threatId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.threatId as string);
  const { note } = req.body;
  const ownership = await userOwnsThreat(id, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  const threat = await prisma.enemyThreat.update({
    where: { id },
    data: { note }
  });
  res.json(threat);
});

app.delete('/api/draft-plans/threats/:threatId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.threatId as string);
  const ownership = await userOwnsThreat(id, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  await prisma.enemyThreat.delete({ where: { id } });
  res.json({ success: true });
});

app.post('/api/draft-plans/:id/item-timings', authenticateToken, async (req, res) => {
  const draftPlanId = parseInt(req.params.id as string);
  const { timing, explanation } = req.body;
  const ownership = await userOwnsDraftPlan(draftPlanId, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  const itemTiming = await prisma.itemTiming.create({
    data: { draftPlanId, timing, explanation }
  });
  res.json(itemTiming);
});

app.delete('/api/draft-plans/item-timings/:timingId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.timingId as string);
  const ownership = await userOwnsTiming(id, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  await prisma.itemTiming.delete({ where: { id } });
  res.json({ success: true });
});

app.put('/api/draft-plans/item-timings/:timingId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.timingId as string);
  const { timing, explanation } = req.body;
  const ownership = await userOwnsTiming(id, req.user!.id);
  if (!handleOwnershipResult(res, ownership)) return;

  const itemTiming = await prisma.itemTiming.update({
    where: { id },
    data: { timing, explanation }
  });
  res.json(itemTiming);
});

// --- OpenDota Heroes integration & caching ---
app.get('/api/heroes', authenticateToken, async (req, res) => {
  let cachedHeroes: Awaited<ReturnType<typeof prisma.heroCache.findMany>> = [];
  try {
    cachedHeroes = await prisma.heroCache.findMany({
      orderBy: { localizedName: 'asc' }
    });

    if (cachedHeroes.length > 0) {
      const firstHero = cachedHeroes[0];
      const cacheAgeMs = new Date().getTime() - new Date(firstHero.updatedAt).getTime();
      const cacheHasImages = cachedHeroes.every(hero => Boolean(hero.imageUrl));
      const cacheUsesReachableImageHost = cachedHeroes.every(hero =>
        !hero.imageUrl || hero.imageUrl.startsWith('https://cdn.cloudflare.steamstatic.com/')
      );

      if (cacheAgeMs < HERO_CACHE_MAX_AGE_MS && cacheHasImages && cacheUsesReachableImageHost) {
        return res.json(cachedHeroes);
      }
    }

    const response = await axios.get('https://api.opendota.com/api/heroStats');
    const heroesData = response.data;
    
    // Using transaction for bulk upserts efficiently in pg
    const savePromises = heroesData.map((h: any) => 
      prisma.heroCache.upsert({
        where: { id: h.id },
        update: {
          name: h.name,
          localizedName: h.localized_name,
          primaryAttr: h.primary_attr,
          attackType: h.attack_type,
          roles: h.roles ?? [],
          legs: h.legs,
          imageUrl: resolveHeroImageUrl(h.img)
        },
        create: {
          id: h.id,
          name: h.name,
          localizedName: h.localized_name,
          primaryAttr: h.primary_attr,
          attackType: h.attack_type,
          roles: h.roles ?? [],
          legs: h.legs,
          imageUrl: resolveHeroImageUrl(h.img)
        }
      })
    );
    await Promise.all(savePromises);
    
    const freshHeroes = await prisma.heroCache.findMany({
      orderBy: { localizedName: 'asc' }
    });
    res.json(freshHeroes);
  } catch (error) {
    console.error('Failed to fetch heroes', error);
    if (cachedHeroes.length > 0) {
      return res.json(cachedHeroes);
    }
    res.status(500).json({ error: 'Failed to fetch heroes' });
  }
});

// ==========================================
// BONUS: Long-running task worker processing
// ==========================================
async function processJobQueue() {
  try {
    // Attempt to acquire a pending job atomically
    // We use a raw query with FOR UPDATE SKIP LOCKED to prevent concurrent workers from taking the same job
    const jobs: any[] = await prisma.$queryRaw`
      UPDATE "JobQueue"
      SET status = 'PROCESSING', "updatedAt" = NOW()
      WHERE id = (
        SELECT id FROM "JobQueue" 
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC 
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *;
    `;

    if (jobs.length > 0) {
      const job = jobs[0];
      console.log(`Processing job ${job.id} of type ${job.type}...`);
      
      // Simulate long running work (10 seconds)
      await new Promise(resolve => setTimeout(resolve, 10000));

      if (job.type === 'ANALYZE_SYNERGY') {
        const payload = JSON.parse(job.payload);
        
        // Example computation: Update draft plan with a calculated note
        await prisma.draftPlan.update({
          where: { id: payload.draftPlanId },
          data: { synergyNote: 'Automated Agent Analysis: Good potential team fight synergy detected.' }
        });

        await prisma.jobQueue.update({
          where: { id: job.id },
          data: { status: 'COMPLETED', result: 'Synergy analyzed.' }
        });
        console.log(`Completed job ${job.id}`);
      }
    }
  } catch (err) {
    console.error('Error processing job queue:', err);
  }
}

// Poll every 5 seconds
setInterval(processJobQueue, 5000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
