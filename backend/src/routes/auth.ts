import { Router } from 'express';
import { loginUser, registerUser } from '../services/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const user = await registerUser(username, password);
    res.json({ id: user.id, username: user.username });
  } catch {
    res.status(400).json({ error: 'Username may already exist' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const session = await loginUser(username, password);

  if (!session) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json(session);
});

export default router;
