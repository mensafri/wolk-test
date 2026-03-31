import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import { getHeroes } from '../services/heroes';

const router = Router();

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const heroes = await getHeroes();
    res.json(heroes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch heroes' });
  }
});

export default router;
