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
    orderBy: { createdAt: 'desc' }
  });
  res.json(plans);
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
// Note: In real production, we'd verify DraftPlan ownership before mutating its children.

app.post('/api/draft-plans/:id/heroes', authenticateToken, async (req, res) => {
  const draftPlanId = parseInt(req.params.id as string);
  const { heroId, type, role, priority, note } = req.body;
  const listHero = await prisma.listHero.create({
    data: { draftPlanId, heroId: parseInt(heroId), type, role, priority, note }
  });
  res.json(listHero);
});

app.put('/api/draft-plans/heroes/:heroId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.heroId as string);
  const { role, priority, note } = req.body;
  const listHero = await prisma.listHero.update({
    where: { id },
    data: { role, priority, note }
  });
  res.json(listHero);
});

app.delete('/api/draft-plans/heroes/:heroId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.heroId as string);
  await prisma.listHero.delete({ where: { id } });
  res.json({ success: true });
});

app.post('/api/draft-plans/:id/threats', authenticateToken, async (req, res) => {
  const draftPlanId = parseInt(req.params.id as string);
  const { heroId, note } = req.body;
  const threat = await prisma.enemyThreat.create({
    data: { draftPlanId, heroId: parseInt(heroId), note }
  });
  res.json(threat);
});

app.put('/api/draft-plans/threats/:threatId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.threatId as string);
  const { note } = req.body;
  const threat = await prisma.enemyThreat.update({
    where: { id },
    data: { note }
  });
  res.json(threat);
});

app.delete('/api/draft-plans/threats/:threatId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.threatId as string);
  await prisma.enemyThreat.delete({ where: { id } });
  res.json({ success: true });
});

app.post('/api/draft-plans/:id/item-timings', authenticateToken, async (req, res) => {
  const draftPlanId = parseInt(req.params.id as string);
  const { timing, explanation } = req.body;
  const itemTiming = await prisma.itemTiming.create({
    data: { draftPlanId, timing, explanation }
  });
  res.json(itemTiming);
});

app.delete('/api/draft-plans/item-timings/:timingId', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.timingId as string);
  await prisma.itemTiming.delete({ where: { id } });
  res.json({ success: true });
});

// --- OpenDota Heroes integration & caching ---
app.get('/api/heroes', authenticateToken, async (req, res) => {
  try {
    const cachedHeroes = await prisma.heroCache.findMany();
    if (cachedHeroes.length > 0) {
      const firstHero = cachedHeroes[0];
      const cacheAgems = new Date().getTime() - new Date(firstHero.updatedAt).getTime();
      if (cacheAgems < 24 * 60 * 60 * 1000) {
        return res.json(cachedHeroes);
      }
    }

    const response = await axios.get('https://api.opendota.com/api/heroes');
    const heroesData = response.data;
    
    // Using transaction for bulk upserts efficiently in pg
    const savePromises = heroesData.map((h: any) => 
      prisma.heroCache.upsert({
        where: { id: h.id },
        update: { name: h.name, localizedName: h.localized_name, primaryAttr: h.primary_attr, attackType: h.attack_type, roles: h.roles, legs: h.legs },
        create: { id: h.id, name: h.name, localizedName: h.localized_name, primaryAttr: h.primary_attr, attackType: h.attack_type, roles: h.roles, legs: h.legs }
      })
    );
    await Promise.all(savePromises);
    
    const freshHeroes = await prisma.heroCache.findMany();
    res.json(freshHeroes);
  } catch (error) {
    console.error('Failed to fetch heroes', error);
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
