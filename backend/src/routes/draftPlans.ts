import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  addHeroToDraftPlan,
  addItemTimingToDraftPlan,
  addThreatToDraftPlan,
  createDraftPlanForUser,
  deleteItemTimingForUser,
  deleteListHeroForUser,
  deleteThreatForUser,
  getDraftPlanDetailForUser,
  listDraftPlansForUser,
  updateItemTimingForUser,
  updateListHeroForUser,
  updateThreatForUser
} from '../services/draftPlans';
import { handleOwnershipResult } from '../services/ownership';
import { parseIntegerBody, parseIntegerParam } from '../utils/http';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  const plans = await listDraftPlansForUser(req.user!.id);
  res.json(plans);
});

router.post('/', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const plan = await createDraftPlanForUser(req.user!.id, { name, description });
  res.json(plan);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const planId = parseIntegerParam(req.params.id, 'draft plan id', res);
  if (planId === null) {
    return;
  }

  const result = await getDraftPlanDetailForUser(planId, req.user!.id);
  if (result.status === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (result.status === 'FORBIDDEN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(result.data);
});

router.post('/:id/heroes', authenticateToken, async (req, res) => {
  const planId = parseIntegerParam(req.params.id, 'draft plan id', res);
  if (planId === null) {
    return;
  }

  const heroId = parseIntegerBody(req.body.heroId, 'heroId', res);
  if (heroId === null) {
    return;
  }

  const result = await addHeroToDraftPlan(planId, req.user!.id, {
    heroId,
    type: req.body.type,
    role: req.body.role,
    priority: req.body.priority,
    note: req.body.note
  });

  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.put('/heroes/:heroId', authenticateToken, async (req, res) => {
  const listHeroId = parseIntegerParam(req.params.heroId, 'hero list id', res);
  if (listHeroId === null) {
    return;
  }

  const result = await updateListHeroForUser(listHeroId, req.user!.id, {
    role: req.body.role,
    priority: req.body.priority,
    note: req.body.note
  });

  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.delete('/heroes/:heroId', authenticateToken, async (req, res) => {
  const listHeroId = parseIntegerParam(req.params.heroId, 'hero list id', res);
  if (listHeroId === null) {
    return;
  }

  const result = await deleteListHeroForUser(listHeroId, req.user!.id);
  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.post('/:id/threats', authenticateToken, async (req, res) => {
  const planId = parseIntegerParam(req.params.id, 'draft plan id', res);
  if (planId === null) {
    return;
  }

  const heroId = parseIntegerBody(req.body.heroId, 'heroId', res);
  if (heroId === null) {
    return;
  }

  const result = await addThreatToDraftPlan(planId, req.user!.id, {
    heroId,
    note: req.body.note
  });

  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.put('/threats/:threatId', authenticateToken, async (req, res) => {
  const threatId = parseIntegerParam(req.params.threatId, 'threat id', res);
  if (threatId === null) {
    return;
  }

  const result = await updateThreatForUser(threatId, req.user!.id, req.body.note);
  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.delete('/threats/:threatId', authenticateToken, async (req, res) => {
  const threatId = parseIntegerParam(req.params.threatId, 'threat id', res);
  if (threatId === null) {
    return;
  }

  const result = await deleteThreatForUser(threatId, req.user!.id);
  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.post('/:id/item-timings', authenticateToken, async (req, res) => {
  const planId = parseIntegerParam(req.params.id, 'draft plan id', res);
  if (planId === null) {
    return;
  }

  const result = await addItemTimingToDraftPlan(planId, req.user!.id, {
    timing: req.body.timing,
    explanation: req.body.explanation
  });

  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.put('/item-timings/:timingId', authenticateToken, async (req, res) => {
  const timingId = parseIntegerParam(req.params.timingId, 'item timing id', res);
  if (timingId === null) {
    return;
  }

  const result = await updateItemTimingForUser(timingId, req.user!.id, {
    timing: req.body.timing,
    explanation: req.body.explanation
  });

  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

router.delete('/item-timings/:timingId', authenticateToken, async (req, res) => {
  const timingId = parseIntegerParam(req.params.timingId, 'item timing id', res);
  if (timingId === null) {
    return;
  }

  const result = await deleteItemTimingForUser(timingId, req.user!.id);
  if (result.status !== 'OK') {
    handleOwnershipResult(res, result.status);
    return;
  }

  res.json(result.data);
});

export default router;
