import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Routes

// --- Draft Plans ---

app.get('/api/draft-plans', async (req, res) => {
  const plans = await prisma.draftPlan.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(plans);
});

app.post('/api/draft-plans', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const plan = await prisma.draftPlan.create({
    data: { name, description }
  });
  res.json(plan);
});

app.get('/api/draft-plans/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const plan = await prisma.draftPlan.findUnique({
    where: { id },
    include: {
      heroes: true,
      enemyThreats: true,
      itemTimings: true
    }
  });
  if (!plan) return res.status(404).json({ error: 'Not found' });
  res.json(plan);
});

// --- List Heroes (Ban / Preferred) ---

app.post('/api/draft-plans/:id/heroes', async (req, res) => {
  const draftPlanId = parseInt(req.params.id);
  const { heroId, type, role, priority, note } = req.body;
  
  if (!heroId || !type) return res.status(400).json({ error: 'heroId and type are required' });

  const listHero = await prisma.listHero.create({
    data: {
      draftPlanId,
      heroId: parseInt(heroId),
      type,
      role,
      priority,
      note
    }
  });
  res.json(listHero);
});

app.put('/api/draft-plans/heroes/:heroId', async (req, res) => {
  const id = parseInt(req.params.heroId);
  const { role, priority, note } = req.body;

  const listHero = await prisma.listHero.update({
    where: { id },
    data: { role, priority, note }
  });
  res.json(listHero);
});

app.delete('/api/draft-plans/heroes/:heroId', async (req, res) => {
  const id = parseInt(req.params.heroId);
  await prisma.listHero.delete({ where: { id } });
  res.json({ success: true });
});

// --- Enemy Threats ---

app.post('/api/draft-plans/:id/threats', async (req, res) => {
  const draftPlanId = parseInt(req.params.id);
  const { heroId, note } = req.body;

  const threat = await prisma.enemyThreat.create({
    data: { draftPlanId, heroId: parseInt(heroId), note }
  });
  res.json(threat);
});

app.put('/api/draft-plans/threats/:threatId', async (req, res) => {
  const id = parseInt(req.params.threatId);
  const { note } = req.body;

  const threat = await prisma.enemyThreat.update({
    where: { id },
    data: { note }
  });
  res.json(threat);
});

app.delete('/api/draft-plans/threats/:threatId', async (req, res) => {
  const id = parseInt(req.params.threatId);
  await prisma.enemyThreat.delete({ where: { id } });
  res.json({ success: true });
});

// --- Item Timings ---

app.post('/api/draft-plans/:id/item-timings', async (req, res) => {
  const draftPlanId = parseInt(req.params.id);
  const { timing, explanation } = req.body;

  const itemTiming = await prisma.itemTiming.create({
    data: { draftPlanId, timing, explanation }
  });
  res.json(itemTiming);
});

app.delete('/api/draft-plans/item-timings/:timingId', async (req, res) => {
  const id = parseInt(req.params.timingId);
  await prisma.itemTiming.delete({ where: { id } });
  res.json({ success: true });
});

// --- OpenDota Heroes integration & caching ---
app.get('/api/heroes', async (req, res) => {
  try {
    // Check cache in DB first
    const cachedHeroes = await prisma.heroCache.findMany();
    if (cachedHeroes.length > 0) {
      // Check if cache is older than 24 hours
      const firstHero = cachedHeroes[0];
      const cacheAgems = new Date().getTime() - new Date(firstHero.updatedAt).getTime();
      if (cacheAgems < 24 * 60 * 60 * 1000) {
        return res.json(cachedHeroes);
      }
    }

    // Fetch from OpenDota
    const response = await axios.get('https://api.opendota.com/api/heroes');
    const heroesData = response.data;
    
    // Save to cache
    const savePromises = heroesData.map((h: any) => 
      prisma.heroCache.upsert({
        where: { id: h.id },
        update: {
          name: h.name,
          localizedName: h.localized_name,
          primaryAttr: h.primary_attr,
          attackType: h.attack_type,
          roles: h.roles,
          legs: h.legs
        },
        create: {
          id: h.id,
          name: h.name,
          localizedName: h.localized_name,
          primaryAttr: h.primary_attr,
          attackType: h.attack_type,
          roles: h.roles,
          legs: h.legs
        }
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
